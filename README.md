# Securing Full Stack Web Application with Keycloak

將介紹了如何使用 Keycloak 來保護 Todo List 應用，該應用由 Spring Boot 和 React 實現，包括後端 `my-todo-list-api` 和前端 `my-todo-list-ui`。

## 前置條件

- 安裝 Docker

## 啟動 Keycloak

1. 執行以下命令啟動 Keycloak Docker 容器：
    ```sh
    docker run --rm --name keycloak \
      -p 9080:8080 \
      -e KEYCLOAK_ADMIN=admin \
      -e KEYCLOAK_ADMIN_PASSWORD=admin \
      quay.io/keycloak/keycloak:24.0.2 start-dev
    ```

## 配置 Keycloak

1. **登錄 Keycloak**
    - 打開瀏覽器，訪問 `http://localhost:9080`
    - 使用用戶名和密碼 `admin` 登錄

2. **創建新 Realm**
    - 點擊包含 "Keycloak" 的下拉菜單，選擇 "Create Realm"
    - 將 "Realm name" 設置為 `my-realm`，然後點擊 "Create"

3. **禁用 "Verify Profile" 必要操作**
    - 前往 "Authentication" > "Required actions"
    - 禁用 "Verify Profile"

4. **創建新客戶端**
    - 前往 "Clients" > "Create client"
    - 將 "Client ID" 設置為 `my-todo-list`，使用默認設置繼續
    - 將 "Valid redirect URIs" 設置為 `http://localhost:3000/*`，將 "Web origins" 設置為 `+`

5. **創建新角色**
    - 前往 "Roles" > "Create Role"
    - 將角色名稱設置為 `MY-TODO-LIST-USER`

6. **將用戶客戶端角色映射到令牌聲明**
    - 在 `my-todo-list` 客戶端配置中，前往 "Client scopes" > `my-todo-list-dedicated`
    - 配置一個新的映射器：
        - 名稱：`Client Roles`
        - 客戶端 ID：`my-todo-list`
        - 令牌聲明名稱：`client_roles`
        - 啟用 "Add to ID token"，禁用 "Add to access token"

7. **創建新群組**
    - 前往 "Groups" > "Create group"
    - 名稱設置為 `MyToDoListUsers` 並分配 `MY-TODO-LIST-USER` 角色

8. **創建新用戶**
    - 前往 "Users" > "Create new user"
    - 設置用戶名 `app-user`，並啟用 "Email verified"
    - 加入 `MyToDoListUsers` 群組
    - 設置密碼（`123`）並禁用 "Temporary"

## 保護後端應用

1. **更新 `pom.xml`**
    ```xml
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
    </dependency>
    ```

2. **創建安全包**
    - 創建 `com.example.mytodolistapi.security` 包

3. **創建 `JwtAuthenticationTokenConverter` 類**
    ```java
    @Component
    public class JwtAuthenticationTokenConverter implements Converter<Jwt, AbstractAuthenticationToken> {
        @Value("${jwt.auth.converter.resource-id}")
        private String resourceId;
        @Value("${jwt.auth.converter.principal-attribute}")
        private String principalAttribute;

        @Override
        public AbstractAuthenticationToken convert(Jwt jwt) {
            Collection<GrantedAuthority> authorities = Stream.concat(
                jwtGrantedAuthoritiesConverter.convert(jwt).stream(),
                extractResourceRoles(jwt).stream()
            ).collect(Collectors.toSet());

            String claimName = principalAttribute == null ? JwtClaimNames.SUB : principalAttribute;
            return new JwtAuthenticationToken(jwt, authorities, jwt.getClaim(claimName));
        }

        private Collection<? extends GrantedAuthority> extractResourceRoles(Jwt jwt) {
            Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
            Map<String, Object> resource;
            Collection<String> resourceRoles;
            if (resourceAccess == null
                || (resource = (Map<String, Object>) resourceAccess.get(resourceId)) == null
                || (resourceRoles = (Collection<String>) resource.get("roles")) == null) {
                return Collections.emptySet();
            }
            return resourceRoles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toSet());
        }
    }
    ```

4. **創建 `WebSecurityConfig` 類**
    ```java
    @Configuration
    @EnableWebSecurity
    public class WebSecurityConfig {
        private final JwtAuthenticationTokenConverter jwtAuthenticationTokenConverter;

        public WebSecurityConfig(JwtAuthenticationTokenConverter jwtAuthenticationTokenConverter) {
            this.jwtAuthenticationTokenConverter = jwtAuthenticationTokenConverter;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            return http
                .authorizeHttpRequests(authorize -> authorize
                    .requestMatchers("/api/**").hasRole("MY-TODO-LIST-USER")
                    .anyRequest().denyAll())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationTokenConverter)))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(Customizer.withDefaults())
                .build();
        }
    }
    ```

5. **更新 `application.properties`**
    ```properties
    spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:9080/realms/my-realm
    jwt.auth.converter.resource-id=my-todo-list
    jwt.auth.converter.principal-attribute=preferred_username
    logging.level.org.springframework.security=DEBUG
    ```

## 保護前端應用

1. **安裝 NPM 套件**
    ```sh
    npm install react-router-dom oidc-client-ts react-oidc-context
    ```

2. **創建 `PrivateRoute.js`**
    ```javascript
    import { useAuth } from "react-oidc-context";
    import { Spin, Typography } from 'antd';
    const { Title } = Typography;

    function PrivateRoute({ children }) {
        const auth = useAuth();

        if (auth.isLoading) {
            return (
                <div style={{ textAlign: "center" }}>
                    <Title>Keycloak is loading</Title>
                    <Spin size="large" />
                </div>
            );
        }

        if (auth.error) {
            return (
                <div style={{ textAlign: "center" }}>
                    <Title>Oops ...</Title>
                    <Title level={2} style={{ color: 'grey' }}>{auth.error.message}</Title>
                </div>
            );
        }

        if (!auth.isAuthenticated) {
            auth.signinRedirect();
            return null;
        }

        return children;
    }

    export default PrivateRoute;
    ```

3. **創建 `AuthBar.js`**
    ```javascript
    import React from 'react';
    import { useAuth } from "react-oidc-context";
    import { Space, Typography, Button } from 'antd';
    const { Text } = Typography;

    function AuthBar() {
        const auth = useAuth();

        return (
            <Space style={{ background: "lightgrey", justifyContent: "end", paddingRight: "10px" }}>
                <Text>Hi {auth.user?.profile.preferred_username}</Text>
                <Button type="primary" size="small" onClick={() => auth.signoutRedirect()} danger>
                    Logout
                </Button>
            </Space>
        );
    }

    export default AuthBar;
    ```

4. **更新 `App.js`**
    ```javascript
    import React from 'react';
    import Home from './components/Home';
    import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import PrivateRoute from './components/PrivateRoute';

    function App() {
        return (
            <Router>
                <Routes>
                    <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        );
    }

    export default App;
    ```

5. **更新 `MyToDoListApi.js`**
    ```javascript
    function getToDos(access_token) {
        return instance.get('/api/todos', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
    }

    function addToDo(addToDoRequest, access_token) {
        return instance.post('/api/todos', addToDoRequest, {
            headers: { 'Content-type': 'application/json', 'Authorization': `Bearer ${access_token}` }
        });
    }

    function deleteToDo(id, access_token) {
        return instance.delete(`/api/todos/${id}`, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
    }

    function updateToDo(id, completed, access_token) {
        return instance.patch(`/api/todos/${id}?completed=${completed}`, {}, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
    }
    ```

6. **更新 `Home.js`**
    ```javascript
    import React, { useEffect, useState } from 'react';
    import { useAuth } from "react-oidc-context";
    import AuthBar from './AuthBar';
    import { Typography, Layout, Row, Col } from 'antd';
    const { Header, Content } = Layout;
    const { Title } = Typography;

    function Home() {
        const [todos, setTodos] = useState([]);
        const auth = useAuth();
        const access_token = auth.user.access_token;

        const handleToDos = async () => {
            try {
                const response = await myToDoListApi.getToDos(access_token);
                setTodos(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        const onFinish = async (addToDoRequest) => {
            try {
                await myToDoListApi.addToDo(addToDoRequest, access_token);
                await handleToDos();
            } catch (error) {
                console.error(error);
            }
        };

        const onComplete = async (key) => {
            try {
                await myToDoListApi.updateToDo(key, true, access_token);
                await handleToDos();
            } catch (error) {
                console.error(error);
            }
        };

        const onDelete = async (key) => {
            try {
                await myToDoListApi.deleteToDo(key, access_token);
                await handleToDos();
            } catch (error) {
                console.error(error);
            }
        };

        const isUser = () => {
            const { profile } = auth.user;
            return profile && profile.client_roles?.includes('MY-TODO-LIST-USER');
        };

        useEffect(() => {
            handleToDos();
        }, [access_token]);

        return (
            <Layout>
                <Header style={{ textAlign: 'center', color: '#fff' }}>MyToDoList</Header>
                <AuthBar />
                {isUser() ? (
                    <Content>
                        <Row justify="center">
                            <Col span={8}>
                                <ToDoForm onFinish={onFinish} />
                            </Col>
                            <Col span={16}>
                                <ToDoTable todos={todos} onComplete={onComplete} onDelete={onDelete} />
                            </Col>
                        </Row>
                    </Content>
                ) : (
                    <div style={{ textAlign: "center" }}>
                        <Title>Oops ...</Title>
                        <Title level={2} style={{ color: 'grey' }}>It looks like you do not have the MY-TODO-LIST-USER role!</Title>
                    </div>
                )}
            </Layout>
        );
    }

    export default Home;
    ```

7. **更新 `index.js`**
    ```javascript
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App';
    import { AuthProvider } from "react-oidc-context";

    const root = ReactDOM.createRoot(document.getElementById('root'));

    const oidcConfig = {
        authority: "http://localhost:9080/realms/my-realm",
        client_id: "my-todo-list",
        redirect_uri: "http://localhost:3000",
        onSigninCallback: () => {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    root.render(
        <AuthProvider {...oidcConfig}>
            <React.StrictMode>
                <App />
            </React.StrictMode>
        </AuthProvider>
    );
    ```

## 啟動應用

1. 啟動後端應用：
    ```sh
    ./mvnw clean spring-boot:run
    ```
2. 啟動前端應用：
    ```sh
    npm start
    ```

## 測試 MyToDoList 的安全性

1. **測試 API 安全性**
    - 在未提供訪問令牌的情況下嘗試獲取 To-Dos 列表：
        ```sh
        curl -i http://localhost:8080/api/todos
        ```
      應返回 `HTTP/1.1 401 Unauthorized`

    - 從 Keycloak 獲取訪問令牌：
        ```sh
        curl -X POST \
          "http://localhost:9080/realms/my-realm/protocol/openid-connect/token" \
          -H "Content-Type: application/x-www-form-urlencoded" \
          -d "username=app-user" \
          -d "password=123" \
          -d "grant_type=password" \
          -d "client_id=my-todo-list"
        ```

    - 使用訪問令牌獲取 To-Dos 列表：
        ```sh
        curl -i http://localhost:8080/api/todos -H "Authorization: Bearer $APP_USER_ACCESS_TOKEN"
        ```
      應返回 `HTTP/1.1 200 OK`

2. **測試 UI 安全性**
    - 在瀏覽器中訪問 `http://localhost:3000`
    - 使用 `app-user` 和密碼 `123` 登錄
    - 互動應用以驗證安全設置

## 關閉應用

- 按 `Ctrl+C` 停止正在運行的應用
- 按 `Ctrl+C` 停止 Keycloak

## 結論

本文介紹了如何使用 Keycloak 為 MyToDoList 應用提供身份和訪問管理安全保護，增強了後端和前端應用的安全性。
