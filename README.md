# WC_backend

---
Currently, The implemented function is a login, signup, logout. ( Need a little more checking )

---
# 1차 테스트

## DB 상황

![](https://github.com/WAYLABctf/WC_backend/blob/main/test/First-day-test-1.png?raw=true)
![](https://github.com/WAYLABctf/WC_backend/blob/main/test/First-day-test-2.png?raw=true)

현재는 위와 같이 총 3명의 사용자와 3개의 문제가 들어있다. 사용자 디비에서의 solved 컬럼은 현재 내가 푼 문제의 ID를 저장하는 컬럼이고, 문제 디비에서의 solver 컬럼은 현재 이 문재를 해결한 사람들을 저장하는 컬럼이고, 이는 JSON으로 해결하기로 했다. (By as3617)

---
## 로그인

![](https://github.com/WAYLABctf/WC_backend/blob/main/test/First-day-test-3.png?raw=true)
![](https://github.com/WAYLABctf/WC_backend/blob/main/test/jwt.png?raw=true)

나는 ID가 2인 `snwo`라는 계정으로 로그인을 했고, jwt가 잘 생성된 것을 볼 수 있다. 

(+ 이메일 인증은 비활성화 시켜 놓음)

---
## 플래그 인증

![](https://github.com/WAYLABctf/WC_backend/blob/main/test/First-day-test-4.png?raw=true)

위와 같이 총 3개 문제의 플래그를 인증했다. (FLAG : waylab, waylab1, waylab2)

---
## DB 확인

![](https://github.com/WAYLABctf/WC_backend/blob/main/test/auth-1.png?raw=true)

1번 문제 인증 후 (usets table)

![](https://github.com/WAYLABctf/WC_backend/blob/main/test/auth-2.png?raw=true)

2 번 문제 인증 후 (usets table)

![](https://github.com/WAYLABctf/WC_backend/blob/main/test/auth-3.png?raw=true)

3 번 문제 인증 후 (usets table)

![](https://github.com/WAYLABctf/WC_backend/blob/main/test/challenges-1.png?raw=true) 

모든 문제를 인증하고 challenges 테이블에서 sovler 컬럼 확인

위와 같이 인증 후 DB를 확인해보면 sovler, solved의 값이 잘 들어간 것을 볼 수 있고, users pts(points) 또한 잘 올라간 것을 확인 할 수 있다.

---
## 플래그 재 인증

![](https://github.com/WAYLABctf/WC_backend/blob/main/test/a-solved-1.png?raw=true)

인증한 플래그를 재 인증하면 위와 같이 이미 해결했다고 한다.
