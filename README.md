# 아이템 시뮬레이터

## 개요

이 프로젝트는 Node.js와 Express.js를 사용하여 게임 아이템 시뮬레이터 서비스를 구현하는 과제입니다. 이 서비스는 사용자가 자신의 게임 아이템과 다른 사용자들의 아이템을 관리하고 비교할 수 있는 기능을 제공합니다. 또한, 사용자가 게임 아이템을 시뮬레이션하여 어떤 아이템이 능력치를 향상시킬 수 있는지 예측할 수 있습니다.

## 기술 스택

- **Node.js**: 서버 사이드 자바스크립트 실행 환경
- **Express.js**: Node.js 웹 애플리케이션 프레임워크
- **MySQL**: 관계형 데이터베이스 (Prisma를 통해 사용)
- **JWT**: JSON Web Token을 사용한 인증
- **AWS EC2**: 배포 플랫폼

## 프로젝트 설치 및 실행

### 요구 사항

- Node.js
- npm
- MySQL

### 설치

1. **레포지토리 클론**

   ```bash
   git clone https://github.com/Ayumudayo/aitemu-simyureetaa.git
   cd aitemu-simyureetaa
   ```

2. **의존성 설치**

   ```bash
   npm install
   ```

3. **환경 변수 설정**

   `.env` 파일을 생성하고, 아래와 같은 환경 변수를 설정합니다.

   ```plaintext
   PORT=3000
   JWT_SECRET=your_jwt_secret
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASS=your_database_password
   DB_NAME=your_database_name
   ```

4. **서버 실행**

   ```bash
   npm start
   ```

## API 문서

### 인증 미들웨어

- **JWT 인증**: 모든 인증이 필요한 API는 `authorization` 헤더를 통해 Bearer 토큰을 사용합니다.

### 엔드포인트

1. **회원가입 API**

   - **Endpoint**: `POST /api/register`
   - **Request Body**:
     ```json
     {
       "username": "string",
       "password": "string",
       "passwordConfirm": "string",
       "name": "string"
     }
     ```

   - **Response**:
     ```json
     {
       "id": "int",
       "username": "string"
     }
     ```

2. **로그인 API**

   - **Endpoint**: `POST /api/login`
   - **Request Body**:
     ```json
     {
       "username": "string",
       "password": "string"
     }
     ```

   - **Response**:
     ```json
     {
       "token": "jwt-token"
     }
     ```

3. **캐릭터 생성 API**

   - **Endpoint**: `POST /api/characters`
   - **Request Body**:
     ```json
     {
       "name": "string"
     }
     ```

   - **Response**:
     ```json
     {
       "characterId": "int"
     }
     ```

4. **캐릭터 삭제 API**

   - **Endpoint**: `DELETE /api/characters/:id`

   - **Response**:
     ```json
     {
       "message": "Character deleted successfully"
     }
     ```

5. **캐릭터 상세 조회 API**

   - **Endpoint**: `GET /api/characters/:id`

   - **Response**:
     ```json
     {
       "name": "string",
       "health": "int",
       "power": "int",
       "money": "int" (If current user owns the character)
     }
     ```

6. **아이템 생성 API**

   - **Endpoint**: `POST /api/items`
   - **Request Body**:
     ```json
     {
       "item_code": "int",
       "item_name": "string",
       "item_stat": {
         "health": "int",
         "power": "int"
       },
       "item_price": "int"
     }
     ```

   - **Response**:
     ```json
     {
       "itemCode": "int",
       "itemName": "string",
       "itemStat": {
         "health": "int",
         "power": "int"
       },
       "itemPrice": "int"
     }
     ```

7. **아이템 수정 API**

   - **Endpoint**: `PATCH /api/items/:code`
   - **Request Body**:
     ```json
     {
       "item_name": "string",
       "item_stat": {
         "health": "int"
       }
     }
     ```

   - **Response**:
     ```json
     {
       "itemCode": "int",
       "itemName": "string",
       "itemStat": {
         "health": "int"
       }
     }
     ```

8. **아이템 목록 조회 API**

   - **Endpoint**: `GET /api/items`

   - **Response**:
     ```json
     [
       {
         "itemCode": "int",
         "itemName": "string",
         "itemPrice": "int"
       }
     ]
     ```

9. **아이템 상세 조회 API**

   - **Endpoint**: `GET /api/items/:code`
   - **Response**:
     ```json
     {
       "itemCode": "int",
       "itemName": "string",
       "itemStat": {
         "attack": "int",
         "defense": "int"
       },
       "itemPrice": "int"
     }
     ```

10. **아이템 구매 API** (JWT 인증 필요)

    - **Endpoint**: `POST /api/characters/:id/purchase`
    - **Request Body**:
      ```json
      {
        "itemsToPurchase": [
          { "itemCode": "int", "count": "int" }
        ]
      }
      ```

    - **Response**:
      ```json
      {
        "message": "Items purchased successfully"
      }
      ```

11. **아이템 판매 API** (JWT 인증 필요)

    - **Endpoint**: `POST /api/characters/:id/sell`
    - **Request Body**:
      ```json
      {
        "itemsToSell": [
          { "itemCode": "int", "count": "int" }
        ]
      }
      ```

    - **Response**:
      ```json
      {
        "message": "Items sold successfully"
      }
      ```

12. **인벤토리 내 아이템 조회 API** (JWT 인증 필요)

    - **Endpoint**: `POST /api/characters/:id/getinv`

    - **Response**:
      ```json
      {
        "inventory": [
          {
            "itemCode": "int",
            "itemName": "string",
            "count": "int"
          }
        ]
      }
      ```

13. **장착한 아이템 목록 조회 API** (JWT 인증 필요)

    - **Endpoint**: `POST /api/characters/:id/getequip`

    - **Response**:
      ```json
      {
        "equippedItems": [
          {
            "itemCode": "int",
            "itemName": "string"
          }
        ]
      }
      ```

14. **아이템 장착 API** (JWT 인증 필요)

    - **Endpoint**: `POST /api/characters/:id/equip`
    - **Request Body**:
      ```json
      {
        "itemCode": "int"
      }
      ```

    - **Response**:
      ```json
      {
        "message": "Item equipped successfully"
      }
      ```

15. **아이템 탈착 API** (JWT 인증 필요)

    - **Endpoint**: `POST /api/characters/:id/unequip`
    - **Request Body**:
      ```json
      {
        "itemCode": "int"
      }
      ```

    - **Response**:
      ```json
      {
        "message": "Item unequipped successfully"
      }
      ```

16. **게임 머니 추가 API** (JWT 인증 필요)

    - **Endpoint**: `POST /api/characters/:id/money`

    - **Response**:
      ```json
      {
        "money": "int"
      }
      ```


# 질답

1. **암호화 방식**
    - 비밀번호를 DB에 저장할 때 Hash를 이용했는데, Hash는 단방향 암호화와 양방향 암호화 중 어떤 암호화 방식에 해당할까요?
        - 해싱은 원본 데이터로 복구가 불가능하기 때문에 단방향 암호화 입니다.
    - 비밀번호를 그냥 저장하지 않고 Hash 한 값을 저장 했을 때의 좋은 점은 무엇인가요?
        - 해싱된 값을 다시 되돌릴 수 없기 때문에, 같은 비밀번호를 사용하는 다른 서비스에 대한 2차 피해를 예방할 수 있습니다.
        - 공격자가 해당 데이터를 즉각 활용하기 어렵다는 장점도 있죠.

2. **인증 방식**
    - JWT(Json Web Token)을 이용해 인증 기능을 했는데, 만약 Access Token이 노출되었을 경우 발생할 수 있는 문제점은 무엇일까요?
        - 사실 상 타인이 완벽히 나의 권한을 행사할 수 있기 때문에, 나와 관련된 모든 데이터 또한 탈취될 수 있습니다.
    - 해당 문제점을 보완하기 위한 방법으로는 어떤 것이 있을까요?
        - OAuth2를 활용하는 Single Sign On(SSO)를 사용하거나 OTP 등의 MFA를 적극적으로 활용하는 것입니다.
        - 물론 큰 테크 기업에서 제공하는 SSO라고 해도 완전히 안전하다고 볼 수는 없지만 쉽게 뚫리는 것도 아닙니다.
        - 또 그런 우려가 있기에 MFA가 적극 활용된다고 생각되네요.

3. **인증과 인가**
    - 인증과 인가가 무엇인지 각각 설명해 주세요.
        - 인증은 사용자가 누구인지 확인하는 절차입니다.
            - 시스템에 접근 권한이 있는지 확인하는 것이죠
            - 로그인 시 비밀번호를 요구하는 것이 인증 절차의 종류 중 하나라고 볼 수 있죠.
        - 인가는 사용자가 어떤 권한이 있는지 확인하는 절차입니다.
            - 똑같이 로그인은 했어도 사용자 마다 권한이 다를 수 있습니다.
            - 사람 마다 다른 권한을 구분하는 과정을 인가라고 할 수 있죠.
            - 일반 캐릭터와 GM 캐릭터의 차이로 비유할 수도 있겠네요.
    - 위 API 구현 명세에서 인증을 필요로 하는 API와 그렇지 않은 API의 차이가 뭐라고 생각하시나요?
        - 인증을 필요로 하는 API는 모두 **데이터를 조작**합니다.
        - DB나 게임의 상태를 인증 없이 조작하는 것은 대단히 큰 보안 리스크입니다.
        - 인증이 없다면 누구나 최강의 캐릭터이자 최고의 부자가 될 수 있습니다. 섭종해야겠네요.
    - 아이템 생성, 수정 API는 인증을 필요로 하지 않는다고 했지만 사실은 어느 API보다도 인증이 필요한 API입니다. 왜 그럴까요?
        - 누구나 아이템을 아무런 제약 없이 막 만들고 수정할 수 있다면 게임의 근간이 무너진 것이나 다름 없습니다.
        - 최강 스탯을 가진 아이템을 만들거나, 저렴한 아이템을 고가로 수정해 판매한다면 밸런스와 경제 모두가 무너질 수 밖에 없겠죠.
        - 이러한 기능은 인증도 매우 중요하지만 엄격한 권한 관리로 함부로 접근할 수 없게 해야 합니다.

4. **Http Status Code**
    - 과제를 진행하면서 사용한 Http Status Code를 모두 나열하고, 각각이 의미하는 것과 어떤 상황에 사용했는지 작성해 주세요.
    1. **200 OK**
        - **의미**: 요청이 성공적으로 처리되었음을 나타냅니다.
        - **사용 상황**: 
     - 성공적으로 데이터를 조회하거나 업데이트했을 때 (예: GET 요청으로 캐릭터 정보를 조회할 때).

    2. **201 Created**
        - **의미**: 새로운 리소스가 성공적으로 생성되었음을 나타냅니다.
        - **사용 상황**:
         - 리소스 생성 성공 시 (예: POST 요청으로 새로운 캐릭터나 아이템을 생성할 때).

    3. **400 Bad Request**
        - **의미**: 클라이언트의 요청이 잘못되어 서버가 이를 이해하지 못하거나 처리할 수 없음을 나타냅니다.
        - **사용 상황**:
            - 요청 데이터의 형식이 올바르지 않거나 필수 정보가 누락된 경우 (예: 잘못된 로그인 데이터로 인한 요청).

    4. **401 Unauthorized**
        - **의미**: 요청이 인증되지 않았거나, 인증에 실패했음을 나타냅니다.
        - **사용 상황**:
            - 인증이 필요한 요청에서 유효하지 않은 또는 누락된 JWT를 제공한 경우 (예: JWT 검증 실패 시).

    5. **403 Forbidden**
        - **의미**: 인증되었으나, 요청된 리소스에 접근할 권한이 없음을 나타냅니다.
        - **사용 상황**:
            - 인증된 사용자가 다른 사용자의 리소스에 접근하려 할 때 (예: 다른 사용자의 캐릭터를 삭제하려 할 때).

    6. **404 Not Found**
        - **의미**: 요청한 리소스를 서버에서 찾을 수 없음을 나타냅니다.
        - **사용 상황**:
            - 존재하지 않는 캐릭터나 아이템을 조회하려 할 때.

    7. **409 Conflict**
        - **의미**: 요청이 현재 서버의 상태와 충돌하여 처리할 수 없음을 나타냅니다.
        - **사용 상황**:
            - 중복된 데이터가 제출된 경우 (예: 이미 존재하는 사용자 이름으로 회원가입을 시도할 때).

    8. **500 Internal Server Error**
        - **의미**: 서버가 예기치 못한 상황으로 요청을 처리할 수 없음을 나타냅니다.
        - **사용 상황**:
            - 서버 내부에서 발생한 예외나 오류로 인해 요청 처리에 실패한 경우.

5. **게임 경제**
    - 현재는 간편한 구현을 위해 캐릭터 테이블에 money라는 게임 머니 컬럼만 추가하였습니다.
        - 이렇게 되었을 때 어떠한 단점이 있을 수 있을까요?
            - 화폐라는 것이 와우로 치자면 꼭 골드만 있을 수 있는 건 아닙니다. 로아에도 실링과 골드가 있죠.
            - 여러개의 화폐를 관리하는 데 있어서 캐릭터 정보까지 다 불러와야 한다면 이 자체가 오버헤드입니다.
            - 또 여러개의 화폐를 캐릭터 테이블에서 관리하게 되면 나중에 정규화 원칙에 위배되는 경우가 생길 수도 있습니다.
            - 그렇다면 확장성의 부족은 물론 유지보수까지 힘들어지는 나쁜 결과를 초래할 수 밖에 없습니다.
        - 이렇게 하지 않고 다르게 구현할 수 있는 방법은 어떤 것이 있을까요?
            - 정규화 원칙을 준수하기 위해 화폐만을 관리하는 테이블을 따로 두는 것이 좋겠습니다.
            - 화폐 종류가 추가/제거될 때 관리가 편해집니다.
            - 캐릭터 테이블에 몰릴 요청이 분산되니 보다 효율적인 처리가 가능합니다.
    - 아이템 구입 시에 가격을 클라이언트에서 입력하게 하면 어떠한 문제점이 있을 수 있을까요?
        - 구입 가격 조작을 통해 가격을 음수로 만든다고 생각해 봅시다.
        - 그럼 매 구입 시 마다 플레이어는 아이템도 얻고 돈도 벌게 됩니다.
        - 경제가 박살난다는 말로도 형용하기 어려운이 벌어지겠죠?
        - 경제에 관련한 연산은 사용자가 간섭할 수 없는 서버 사이드에서만 이루어져야만 합니다.
