import pandas as pd

# 1. Open CSV file
df = pd.read_csv('../data.csv')

# 2. change all 'nodeid' column values into 1
df['nodeid'] = 1

df.to_csv('data.csv', index=False)

print("Success! Check out 'data.csv' file.")