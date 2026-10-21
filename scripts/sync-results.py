"""Mirror the live public CSV to GitHub; leave the last valid file intact on error."""
import csv
import io
import os
import tempfile
import urllib.request
from pathlib import Path

URL = 'https://loop-play-results.devyks-com.chatgpt.site/results.csv'
HEADERS = ['submission_id', 'nickname', 'winner_game_id', 'winner_game_title', 'game_author', 'submitted_at_kst']
GAME_IDS = {'yks', 'kgt', 'ksi', 'ojh', 'psj', 'ksw', 'ldy', 'lsl'}

def validate_csv(data):
    rows = list(csv.reader(io.StringIO(data.decode('utf-8-sig'))))
    if not rows or rows[0] != HEADERS:
        raise ValueError('Unexpected CSV columns')
    ids = set()
    for row in rows[1:]:
        if len(row) != len(HEADERS) or row[2] not in GAME_IDS or row[0] in ids:
            raise ValueError('Invalid or duplicate result row')
        ids.add(row[0])
    return len(ids)

def main():
    request = urllib.request.Request(URL, headers={'User-Agent': 'LOOP-PLAY-results-sync', 'Accept': 'text/csv'})
    with urllib.request.urlopen(request, timeout=30) as response:
        data = response.read(5_000_001)
    if len(data) > 5_000_000:
        raise ValueError('CSV exceeds the supported size')
    count = validate_csv(data)
    path = Path('results/results.csv')
    path.parent.mkdir(exist_ok=True)
    # Refuse accidental loss if the service returns fewer records than the existing snapshot.
    previous = validate_csv(path.read_bytes()) if path.exists() else 0
    if count < previous:
        raise ValueError('Refusing a snapshot with fewer records; review manually')
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as f:
        f.write(data)
        temporary = f.name
    os.replace(temporary, path)
    print(f'Synced {count} results')

if __name__ == '__main__':
    main()
