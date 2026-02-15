# 프론트엔드 컨테이너 이미지 빌드

## 서비스 정보
- 서비스명: home-starter-front
- 빌드 도구: Vite (React + TypeScript)
- 런타임: Nginx (stable-alpine)
- 포트: 8080

## 빌드 과정

### 1. 의존성 동기화
```bash
npm install
```

### 2. 설정 파일 생성
- `deployment/container/nginx.conf`: Nginx 서버 설정 (SPA 라우팅, 캐시, 헬스체크)
- `deployment/container/Dockerfile-frontend`: 멀티스테이지 빌드 Dockerfile

### 3. 컨테이너 이미지 빌드
```bash
DOCKER_FILE=deployment/container/Dockerfile-frontend

docker build \
  --platform linux/amd64 \
  --build-arg PROJECT_FOLDER="." \
  --build-arg BUILD_FOLDER="deployment/container" \
  --build-arg EXPORT_PORT="8080" \
  -f ${DOCKER_FILE} \
  -t daewoongjeon/home-starter-front:latest .
```

### 4. 이미지 확인
```bash
docker images | grep home-starter-front
```

## 빌드 결과
| 항목 | 값 |
|------|-----|
| 이미지명 | home-starter-front:latest |
| 이미지 크기 | 60.4MB |
| 플랫폼 | linux/amd64 |
| 베이스 이미지 | nginx:stable-alpine |

## Dockerfile 구조 (멀티스테이지)
1. **Build Stage** (node:20-slim): 소스 빌드 → dist 생성
2. **Run Stage** (nginx:stable-alpine): dist 파일 서빙, nginx 설정 적용
