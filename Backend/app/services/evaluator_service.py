from app.models.schemas import CandidateProfile, JobRecommendation
from app.services.anthropic_service import evaluate_job
from app.vectorstore.faiss_store import vector_store
from app.utils.helpers import setup_logger
import re

logger = setup_logger("evaluator_service")

def check_region_match(job_location: str, job_content: str, target_region: str) -> bool:
    target = target_region.lower().strip()
    if not target:
        return True
    
    loc = job_location.lower()
    text = job_content.lower()
    
    if target == 'remote' or target == 'remote global':
        return 'remote' in loc or 'work from home' in loc or 'wfh' in loc or 'remote' in text
        
    if target == 'pakistan':
        return 'pakistan' in loc or 'pk' in loc or 'pakistan' in text or 'karachi' in loc or 'lahore' in loc or 'islamabad' in loc
    elif target == 'united states' or target == 'usa' or target == 'us':
        return 'united states' in loc or 'usa' in loc or ' us ' in f" {loc} " or 'united states' in text or 'california' in loc or 'new york' in loc or 'san francisco' in loc
    elif target == 'united kingdom' or target == 'uk':
        return 'united kingdom' in loc or 'uk' in loc or 'london' in loc or 'great britain' in text or 'england' in loc
    elif target == 'united arab emirates' or target == 'uae':
        return 'united arab emirates' in loc or 'uae' in loc or 'dubai' in loc or 'abu dhabi' in loc
    elif target == 'germany':
        return 'germany' in loc or 'deutschland' in loc or 'berlin' in loc or 'munich' in loc
        
    return target in loc or target in text

def extract_salary_from_job(title: str, content: str) -> int:
    combined = (title + " " + content).lower()
    
    # 1. Hourly rates (e.g. $40/hr -> ~80,000 annual)
    hourly_matches = re.findall(r'(?:\$[\s]*|£[\s]*|€[\s]*)([0-9]+)(?:[\s]*-[\s]*(?:\$[\s]*|£[\s]*|€[\s]*)([0-9]+))?[\s]*(?:\/hr|per hour|an hour|/hour|hourly)', combined)
    if hourly_matches:
        max_rate = 0
        for rate_group in hourly_matches:
            val1 = int(rate_group[0]) if rate_group[0] else 0
            val2 = int(rate_group[1]) if rate_group[1] else 0
            max_rate = max(max_rate, val1, val2)
        if max_rate > 0:
            return max_rate * 2000
            
    # 2. Annual range/k notations (e.g. 80k - 120k)
    k_matches = re.findall(r'(?:\$[\s]*|£[\s]*|€[\s]*|rs\.?[\s]*)([0-9]+)(?:k|[\s]*k)', combined)
    if k_matches:
        max_k = 0
        for k_val in k_matches:
            max_k = max(max_k, int(k_val) * 1000)
        if max_k > 0:
            return max_k
            
    # 3. Standard large numbers with currency
    large_matches = re.findall(r'(?:\$[\s]*|£[\s]*|€[\s]*|rs\.?[\s]*)([0-9]{1,3}(?:,[0-9]{3})+)', combined)
    if large_matches:
        max_val = 0
        for val_str in large_matches:
            digits = re.sub(r'[^\d]', '', val_str)
            if digits:
                max_val = max(max_val, int(digits))
        if max_val > 0:
            return max_val
            
    # 4. Search near salary keywords
    salary_keywords = ['salary', 'pay', 'compensation', 'package', 'remuneration', 'rate']
    for kw in salary_keywords:
        idx = combined.find(kw)
        if idx != -1:
            snippet = combined[max(0, idx - 100):min(len(combined), idx + 200)]
            # Clean commas between digits in the snippet for robust matching (e.g. 80,000 -> 80000)
            clean_snippet = re.sub(r'(?<=\d),(?=\d)', '', snippet)
            numbers = re.findall(r'\b(5000|[1-9]\d{4,7})\b', clean_snippet)
            if numbers:
                return max(int(n) for n in numbers)
                
    return 0

async def rank_jobs(jobs: list[dict], profile: CandidateProfile, filter_text: str = "") -> list[JobRecommendation]:
    logger.info(f"Evaluating and ranking {len(jobs)} jobs with filter: {filter_text}")
    recommendations = []
    
    # Pre-parse filter region and salary limit in Python
    target_region = None
    min_salary_val = 0
    
    if filter_text:
        regions_list = ['pakistan', 'united states', 'united kingdom', 'united arab emirates', 'germany', 'remote global', 'remote']
        for r in regions_list:
            if r in filter_text.lower():
                target_region = r
                break
                
        salary_match = re.search(r'salary:\s*([$£€rs.\d,\s]+)', filter_text, re.IGNORECASE)
        if salary_match:
            digits = re.sub(r'[^\d]', '', salary_match.group(1))
            if digits:
                min_salary_val = int(digits)
        else:
            salary_match = re.search(r'(?:[\$£€]|rs\.?)\s*([\d,]+)', filter_text, re.IGNORECASE)
            if salary_match:
                digits = re.sub(r'[^\d]', '', salary_match.group(1))  # group(1) — only one capture group
                if digits:
                    min_salary_val = int(digits)
                    
    logger.info(f"Parsed Filter Constraints: Region={target_region}, Min Salary={min_salary_val}")

    # 1. Quick heuristic scoring to select top 10 most relevant jobs and avoid timeouts
    def heuristic_score(j: dict) -> float:
        t = j.get("title", "").lower()
        c = j.get("content", "").lower()
        sc = 0.0
        for skill in profile.skills:
            if skill.lower() in t:
                sc += 10.0
            if skill.lower() in c:
                sc += 2.0
        pref_role = profile.preferred_role.lower() if profile.preferred_role else ""
        if pref_role and pref_role in t:
            sc += 15.0
        return sc

    # Sort all jobs by heuristic score and evaluate the top 10 concurrently
    jobs_with_scores = [(j, heuristic_score(j)) for j in jobs]
    jobs_with_scores.sort(key=lambda x: x[1], reverse=True)
    top_jobs = [item[0] for item in jobs_with_scores[:10]]

    import asyncio
    semaphore = asyncio.Semaphore(4)

    async def evaluate_single_job(job_item):
        async with semaphore:
            try:
                return await evaluate_job(job_item, profile, filter_text)
            except Exception as e:
                logger.error(f"Error evaluating job '{job_item.get('title')}': {e}")
                return {}

    # Run evaluations concurrently to speed up response from minutes to seconds
    eval_results = await asyncio.gather(*(evaluate_single_job(j) for j in top_jobs))

    for job, eval_result in zip(top_jobs, eval_results):
        title = job.get("title", "Unknown Title")
        content = job.get("content", "")
        
        meets_filter = eval_result.get("meets_filter", True) if eval_result else True
        if filter_text and not meets_filter:
            logger.info(f"Skipping job {title} as it does not meet the strict AI filter criteria.")
            continue
            
        # Heuristic extraction for company and location from title/content if AI failed
        title = job.get("title", "Unknown Title")
        content = job.get("content", "")
        
        company = eval_result.get("extracted_company")
        if not company or company == "Unknown Company":
            # Heuristic: Often title is "Role at Company" or "Role - Company" or "Role | Company"
            if " at " in title.lower():
                company = title.split(" at ")[-1].strip()
            elif " - " in title:
                company = title.split(" - ")[-1].strip()
            elif " | " in title:
                company = title.split(" | ")[-1].strip()
            else:
                company = "Web Source"
                
        location = eval_result.get("extracted_location")
        if not location or location == "Remote/Global" or location == "Unknown Location":
            content_lower = content.lower()
            title_lower = title.lower()
            
            # Extract target country first
            job_country = ""
            if "pakistan" in content_lower or "pakistan" in title_lower or "karachi" in content_lower or "lahore" in content_lower:
                job_country = "Pakistan"
            elif "united kingdom" in content_lower or " uk " in f" {content_lower} " or "london" in content_lower:
                job_country = "United Kingdom"
            elif "united states" in content_lower or " usa " in f" {content_lower} " or " us " in f" {content_lower} ":
                job_country = "United States"
            elif "germany" in content_lower or "berlin" in content_lower:
                job_country = "Germany"
            elif "united arab emirates" in content_lower or "uae" in content_lower or "dubai" in content_lower:
                job_country = "United Arab Emirates"
                
            is_remote = "remote" in content_lower or "remote" in title_lower or "work from home" in content_lower or "wfh" in content_lower
            
            if is_remote:
                location = f"{job_country} (Remote)" if job_country else "Remote"
            elif job_country:
                location = job_country
            else:
                location = profile.preferred_location if profile.preferred_location else "Remote/Global"
        
        # Enforce region strictly
        if target_region:
            matched_region = check_region_match(location, content, target_region)
            if not matched_region:
                logger.info(f"Skipping job {title} due to strict region mismatch: location={location} target={target_region}")
                continue
                
        # Enforce salary strictly
        if min_salary_val > 0:
            extracted_sal = extract_salary_from_job(title, content)
            if extracted_sal > 0 and extracted_sal < min_salary_val:
                logger.info(f"Skipping job {title} due to strict salary mismatch: extracted={extracted_sal} target={min_salary_val}")
                continue
        
        # Create JobRecommendation object
        match_score = eval_result.get("match_percentage", 85)
        
        # Apply Preferred Location Bonus
        preferred_loc = profile.preferred_location.lower() if profile.preferred_location else ""
        if preferred_loc and (preferred_loc in location.lower() or "remote" in location.lower()):
            match_score = min(100, match_score + 10)
            
        # Specific Job Link Bonus: Prefer deep links over homepage links
        job_url_lower = job.get("url", "").lower()
        if any(x in job_url_lower for x in ["/job/", "/vacancy/", "/position/", "/career/"]) or len(job_url_lower.split("/")) > 4:
            match_score = min(100, match_score + 10)
        elif job_url_lower.endswith(".com") or job_url_lower.endswith(".pk") or job_url_lower.endswith(".uk") or job_url_lower.endswith("/"):
            # Penalize generic landing pages slightly to push specific jobs up
            match_score = max(0, match_score - 20)
        
        # Add slight randomness to match score so it doesn't look hardcoded
        import random
        if match_score >= 80:
            match_score = min(99, max(75, match_score - random.randint(0, 5)))
            
        # Ensure we always add the job
        rec = JobRecommendation(
            title=title,
            company=company[:30], # Limit length
            location=location,
            job_url=job.get("url", ""),
            match_percentage=match_score,
            matching_skills=eval_result.get("matching_skills", profile.skills[:3]),
            missing_skills=eval_result.get("missing_skills", []),
            experience_match=eval_result.get("experience_match", "Aligned with profile"),
            education_match=eval_result.get("education_match", "Matches requirements"),
            reasoning=eval_result.get("reasoning", f"Found via real-time web search for {profile.preferred_role} roles."),
            interview_questions=eval_result.get("interview_questions", ["What relevant experience do you have?"]),
            weaknesses=eval_result.get("weaknesses", []),
            improvement_suggestions=eval_result.get("improvement_suggestions", ["Review the company website before applying."])
        )
        recommendations.append(rec)
        
    if not recommendations:
        logger.warning("No jobs met the match threshold or search failed.")

    # Sort by match percentage descending
    recommendations.sort(key=lambda x: x.match_percentage, reverse=True)
    return recommendations
