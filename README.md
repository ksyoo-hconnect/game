# LOOP PLAY

SiBC팀이 [인바이츠루프 프로토타입 V5](https://claude.ai/artifact/2XZQo8NwGy6Bs4tqyojLfa)를 바탕으로 만든 게임 쇼케이스입니다. 처음 사용하는 분도 V5 사용법을 쉽고 재미있게 익힐 수 있도록 각자 게임을 만들었습니다.

## 실행

저장소를 내려받은 뒤 `index.html`을 브라우저에서 여세요. `games`, `images`, `app.js`, `games.js`를 함께 보관해야 합니다.

GitHub Pages를 사용하려면 저장소 **Settings → Pages → Build and deployment**에서 **Deploy from a branch → main → /(root)**를 선택합니다.

## 구성

- 제작자 8명 소개
- 실제 캡처 이미지, 게임 소개 및 조작법
- HTML 게임 6개와 외부 링크 게임 2개
- 개인별 8강 월드컵, 선택 되돌리기, 브라우저 내 기록 복원
- 게임별 누적 최종 선택 순위, 득표수·비율, 공동 순위

외부 게임은 인터넷 연결이 필요합니다. 일부 원본 게임의 확장 화면은 온라인 라이브러리를 참조합니다. 자세한 내용은 `사용안내.txt`를 참고하세요.

## 월드컵 결과

**현재 상태:** 결과 서버는 사용자 요청에 따라 비공개로 유지하고 있습니다. GitHub에는 익명 제출 코드와 결과 파일이 반영되어 있으나, 실제 우승 화면에는 ‘공용 결과 제출 준비 중’으로 표시합니다. 현재 결과는 브라우저에만 저장됩니다.

서버 연결 후에는 우승 화면의 **우승 결과 제출** 버튼으로 계정 없이 공용 결과를 저장할 수 있습니다. 닉네임은 선택이며, 미입력 시 익명으로 기록됩니다.

- 공용 결과 CSV: https://loop-play-results.devyks-com.chatgpt.site/results.csv
- 실시간 결과 요약: https://loop-play-results.devyks-com.chatgpt.site/
- GitHub 내 기록: [results/results.csv](results/results.csv)

공용 CSV에는 접수 번호, 닉네임, 우승 게임 ID·제목·제작자, 한국 시간 기준 제출 시각을 기록합니다. 닉네임과 결과는 공개됩니다. 전체 경기 기록은 서버에서 대진 검증에 사용합니다.

서버에서 같은 접수 번호와 동일 내용을 다시 제출하면 중복 저장하지 않습니다. 실패 시 우승 화면에서 다시 시도할 수 있습니다. 계정 없이 참여하므로 사람당 한 번만 참여했는지를 보장하지는 않습니다.

실제 연결 시에는 `submission.js`의 `RESULTS_ENABLED`를 `true`로 바꾸고, GitHub 저장소의 Actions 변수 `RESULTS_SYNC_ENABLED`를 `true`로 설정합니다. 현재 두 기능은 비공개 서버로 요청하지 않도록 꺼두었습니다.

활성화 후 GitHub Actions의 `Sync public tournament results`가 5분 주기로 공용 CSV를 저장소에 동기화합니다. GitHub의 실행 대기 상황에 따라 실제 반영은 더 늦을 수 있습니다. Actions에서 `Run workflow`로 수동 동기화할 수도 있습니다.

소개 페이지는 GitHub Pages에서 제공하고, 결과 저장 API와 CSV는 별도 Sites 서버에서 제공합니다. 결과를 제출하려면 인터넷 연결이 필요합니다.

## 누적 인기 순위

사이트의 **인기 순위** 메뉴에서 `results/results.csv`에 기록된 최종 우승 횟수와 전체 제출 대비 비율을 확인할 수 있습니다. 첫 화면에도 최다 선택 게임을 표시합니다.

- 같은 득표수는 공동 순위로 표시하며, 0표 게임에는 순위를 부여하지 않습니다.
- 제출이 없으면 0건과 ‘아직 집계된 결과 없음’을 표시합니다.
- 중간 경기 선택 횟수와 개인 브라우저에만 남아 있는 미제출 결과는 합산하지 않습니다.
- 표시 중인 페이지는 1분마다 확인하며 새로고침 버튼으로 직접 갱신할 수 있습니다.
- GitHub Actions가 파일만 커밋해도 집계할 수 있도록 공개 저장소의 raw CSV를 읽습니다. GitHub의 캐시 및 자동 동기화 대기 시간에 따라 반영이 늦어질 수 있습니다.
- 파일 로드 실패는 0표와 구분하며, 이미 불러온 결과가 있으면 마지막으로 확인한 값을 유지합니다.

집계 테스트: `node --test tests/ranking-data.test.cjs`

## 수정

- 첫 화면과 제작자 소개: `index.html`
- 게임 제목, 제작자, 설명 및 링크: `games.js`
- 대표 이미지: `images/`

제공받은 6개 게임 HTML 원본은 수정하지 않았습니다.
