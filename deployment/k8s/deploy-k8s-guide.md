# 프론트엔드 쿠버네티스 배포 가이드

## 1. 배포 정보

| 항목 | 값 |
|------|-----|
| 시스템명 | homestarter |
| 서비스명 | home-starter-front |
| 이미지 레지스트리 | docker.io |
| 이미지 Organization | daewoongjeon |
| 이미지 | docker.io/daewoongjeon/home-starter-front:latest |
| 백엔드 호스트 | homestarter-api.172.30.1.205.nip.io |
| 프론트엔드 호스트 | homestarter.172.30.1.205.nip.io |
| 네임스페이스 | homestarter-ns |
| 파드 수 | 1 |
| CPU (requests/limits) | 256m / 256m |
| 메모리 (requests/limits) | 256Mi / 256Mi |

## 2. 매니페스트 파일 목록

| 파일 | 리소스 | 이름 |
|------|--------|------|
| configmap.yaml | ConfigMap | cm-home-starter-front |
| ingress.yaml | Ingress | home-starter-front |
| service.yaml | Service | home-starter-front |
| deployment.yaml | Deployment | home-starter-front |

## 3. 배포 가이드 검증 결과

| 검증 항목 | 결과 |
|-----------|------|
| 객체이름 네이밍룰 준수 | ✅ 통과 |
| Ingress backend.service.port.number = Service port (8080) | ✅ 통과 |
| Service targetPort = 8080 | ✅ 통과 |
| Image명 형식 (docker.io/daewoongjeon/home-starter-front:latest) | ✅ 통과 |
| ConfigMap key = runtime-env.js | ✅ 통과 |
| ConfigMap value 내 백엔드 Host = homestarter-api.172.30.1.205.nip.io | ✅ 통과 |

## 4. 사전 확인

### 4.1 네임스페이스 존재 확인
```bash
kubectl get ns homestarter-ns
```

네임스페이스가 없으면 생성합니다:
```bash
kubectl create ns homestarter-ns
```

### 4.2 ImagePullSecret 확인
```bash
kubectl get secret homestarter -n homestarter-ns
```

## 5. 매니페스트 적용

```bash
kubectl apply -f deployment/k8s
```

## 6. 객체 생성 확인

### 6.1 전체 리소스 확인
```bash
kubectl get all -n homestarter-ns
```

### 6.2 개별 리소스 확인
```bash
# ConfigMap 확인
kubectl get configmap cm-home-starter-front -n homestarter-ns

# Ingress 확인
kubectl get ingress home-starter-front -n homestarter-ns

# Service 확인
kubectl get svc home-starter-front -n homestarter-ns

# Deployment 확인
kubectl get deployment home-starter-front -n homestarter-ns

# Pod 상태 확인
kubectl get pods -n homestarter-ns -l app=home-starter-front
```

### 6.3 Pod 로그 확인
```bash
kubectl logs -f -l app=home-starter-front -n homestarter-ns
```

### 6.4 서비스 접속 확인
브라우저에서 아래 URL로 접속하여 확인합니다:
```
http://homestarter.172.30.1.205.nip.io
```
