import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "react-oidc-context";

const oidcConfig = {
    authority: "http://localhost:9080/realms/my-realm",
    client_id: "my-todo-list",
    redirect_uri: "http://localhost:3000",
    onSigninCallback: () => {
        window.history.replaceState({}, document.title, window.location.pathname);
    },
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <AuthProvider {...oidcConfig}>
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
