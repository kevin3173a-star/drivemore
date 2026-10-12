# 🚗 DriveMore

<p>
<b>DriveMore</b>는 카셰어링 서비스를 이용하며 차종별 주행요금을 비교하기 위해 매번 반복하여 계산해야하는 불편함을 해소하기 위해 업체와 연료, 차종 선택 후 주행거리만 입력하면 <b>주행요금을 계산해주는 서비스</b>입니다. 
Supabase 기반의 차량 데이터를 통해 <b>업체, 연료, 차종, 구간별 주행요금</b>으로 분류되어 주행요금을 계산해줍니다.
</p>

---------

## 💡 1. 주제
**업체와 연료, 차종** 선택 후 주행거리만 입력하면 **주행요금을 계산**해주어 **차량별 주행요금을 비교**할 수 있는 서비스

## 📱 2. 핵심 기능
- **업체와 연료, 차종 선택**: 카셰어링 업체와 연료, 차종을 순차적으로 선택하여 원하는 차종의 주행요금 계산 가능 
- **계산 기록**: 최대 5개의 계산 기록이 저장되어 차종별 주행요금 비교 가능 
- **관리자 로그인**: 차량 데이터 관리를 위한 관리자 전용 로그인으로 회원가입 후 관리자의 승인을 통해 권한을 부여받아야 차량 데이터에 접근 가능 
- **차량 데이터 관리**: Supabase 기반 업체, 연료, 차종, 구간별 주행요금의 항목화된 데이터로 수백대의 차량 데이터 관리 가능, CRUD 기능 구현 


## 💻 3. 주요 기술
- **Front-End**: ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
- **데이터관리**: ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
- **환경**: ![VSCode](https://img.shields.io/badge/VSCode-007ACC?style=flat-square\&logo=visualstudiocode\&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square\&logo=github\&logoColor=white)
- **디자인 및 프로토타이핑**: ![Lovable](https://img.shields.io/badge/Lovable-FF69B4?style=flat-square&logo=lovable&logoColor=white)
- **배포**: ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

------------------

## 🔗 배포 URL
**DriveMore** https://drivemore-one.vercel.app/

---------------

## 📅 개발 기간 및 인원
* 2026.07 ~ 2026.08 
* 개인 프로젝트

---------

## 🗂️ 폴더 구조

```
DRIVEMORE
│
├── src
│   ├── app                          # 페이지 및 라우팅
│   │   ├── admin                    # 관리자 페이지
│   │   │   └── users                # 사용자 및 관리자 계정 관리
│   │   ├── api                      # 서버 API
│   │   │   ├── admin                # 관리자 관련 API
│   │   │   └── me                   # 로그인 사용자 관련 API
│   │   ├── auth                     # 로그인 및 회원가입 페이지
│   │   ├── globals.css              # 전역 스타일
│   │   ├── layout.tsx               # 공통 레이아웃
│   │   ├── page.tsx                 # 메인 페이지 및 주행요금 계산
│   │   └── providers.tsx            # 전역 Provider 설정
|   |
│   ├── components                   # 재사용 UI 컴포넌트
│   │   ├── ui                       # 공통 UI 컴포넌트
│   │   └── FareCalculator.tsx       # 주행요금 계산 컴포넌트
│   ├── hooks                        # 커스텀 React Hooks
│   ├── integrations                 # Supabase 연동
│   ├── lib                          # 공통 함수 및 유틸리티
│   └── types                        # TypeScript 타입 정의
      
```

-------

## 💥 트러블슈팅 (Trouble Shooting)

### 📌 1. 관리자 권한 승인 체계 구축 및 접근 제어 구현
> **❗ 문제**: 관리자 권한을 얻으려는 사용자가 별도의 승인 없이 회원가입 후 로그인만을 통해 차량 데이터에 바로 접근할 수 있다는 문제 발생
> 
- **✅ 해결 방안 (Solution)**
  - **사용자 인증과 관리자 권한 분리**:  회원가입 후 별도의 승인을 통해 관리자 권한을 부여받은 사용자만 접근할 수 있도록 해야한다고 판단하였습니다. 이에 회원가입을 통한 사용자 인증과 관리자 권한 부여를 분리하여 관리자의 승인을 통해 권한을 부여받은 사용자만 차량 데이터에 접근할 수 있도록 구현

---

### 📌 2. Vite에서 Next.js로의 전환을 통한 서버 기능 확장 및 구조 개선
> **❗ 문제**: 기존 Vite 기반 프로젝트에 차량 데이터 관리를 위한 로그인 기능을 추가하고자 하였지만 Tailwind CSS 등의 버전 혼재와 서버 로직 확장에 따른 유지보수 문제 발생 

- **✅ 해결 방안 (Solution)**
  - **Next.js 리팩토링**: 별도 Express 서버 없이 서버기능을 제공해주는 Next.js로 리팩토링하고 기존 모듈과 라우팅을 Next.js App Router에 맞게 전환하였습니다. 이를 통해 관리자 로그인 기능을 추가하였고 향후 기능 확장과 유지보수에 용이한 구조 

---
