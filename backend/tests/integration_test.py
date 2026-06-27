import requests

BASE = 'http://localhost:8000'

# Health
assert requests.get(f'{BASE}/health').json()['status'] == 'ok'

# Summary
s = requests.get(f'{BASE}/api/summary').json()
assert s['totals']['total_debit_pkr'] == 129298
assert s['totals']['transaction_count'] == 160
assert s['late_night']['count'] == 41

# Transactions
t = requests.get(f'{BASE}/api/transactions?category=Coffee').json()
assert t['filtered'] == 22

# Insights
i = requests.get(f'{BASE}/api/insights').json()
assert len(i['insights']) == 5
health = next(x for x in i['insights'] if x['id'] == 'health_score')
assert health['metrics']['score'] == 36

# Parse
p = requests.post(f'{BASE}/api/parse-notification',
    json={'raw_text': 'Txn Alert: Rs 1701 spent at MINISO PK'}).json()
assert p['parsed']['merchant_name'] == 'MINISO PK'
assert p['parsed']['amount_pkr'] == 1701.0

print('ALL INTEGRATION TESTS PASS — READY TO BUILD UI')
