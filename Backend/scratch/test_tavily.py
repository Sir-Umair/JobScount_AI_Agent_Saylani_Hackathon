import json
from tavily import TavilyClient

client = TavilyClient(api_key='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')
res = client.search('Python developer jobs in Pakistan', max_results=2)
print(json.dumps(res, indent=2))
