# LOOP PLAY

인바이츠루프 V5를 여덟 가지 게임으로 소개하는 게임 쇼케이스입니다.

## 실행

저장소를 내려받은 뒤 `index.html`을 브라우저에서 여세요. `games`, `images`, `app.js`, `games.js`를 함께 보관해야 합니다.

GitHub Pages를 사용하려면 저장소 **Settings → Pages → Build and deployment**에서 **Deploy from a branch → main → /(root)**를 선택합니다.

## 구성

- 제작자 8명 소개
- 실제 캡처 이미지, 게임 소개 및 조작법
- HTML 게임 6개와 외부 링크 게임 2개
- 개인별 8강 월드컵, 선택 되돌리기, 브라우저 내 기록 복원

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

## 수정

- 첫 화면과 제작자 소개: `index.html`
- 게임 제목, 제작자, 설명 및 링크: `games.js`
- 대표 이미지: `images/`

제공받은 6개 게임 HTML 원본은 수정하지 않았습니다.
