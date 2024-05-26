import React, { useEffect, useState } from "react";
import { myToDoListApi } from "../components/MyToDoListApi";
import { useAuth } from "react-oidc-context";
import AuthBar from './AuthBar'
import { Typography } from 'antd'
import { Layout, Col, Row } from "antd";
import ToDoForm from "./ToDoForm";
import ToDoTable from "./ToDoTable";

const { Header, Content } = Layout
const { Title } = Typography

function Home() {
    const [todos, setTodos] = useState([]);

    const auth = useAuth();
    const access_token = auth.user.access_token;

    useEffect(() => {
        handleToDos();
    }, []);

    const handleToDos = async () => {
        try {
            const response = await myToDoListApi.getToDos(access_token);
            setTodos(response.data);
        } catch (error) {
            handleLogError(error);
        }
    };

    const onFinish = async (addToDoRequest) => {
        try {
            await myToDoListApi.addToDo(addToDoRequest, access_token);
            await handleToDos();
        } catch (error) {
            handleLogError(error);
        }
    };

    const onComplete = async (key) => {
        try {
            await myToDoListApi.updateToDo(key, true, access_token);
            await handleToDos();
        } catch (error) {
            handleLogError(error);
        }
    };

    const onDelete = async (key) => {
        try {
            await myToDoListApi.deleteToDo(key, access_token);
            await handleToDos();
        } catch (error) {
            handleLogError(error);
        }
    };

    const isUser = () => {
        const { profile } = auth.user;
        const hasClientRole = profile?.client_roles?.includes("MY-TODO-LIST-USER");
        return profile && hasClientRole;
    };

    const handleLogError = (error) => {
        if (error.response) {
            console.log(error.response.data);
        } else if (error.request) {
            console.log(error.request);
        } else {
            console.log(error.message);
        }
    };

    const headerStyle = {
        textAlign: "center",
        color: "#fff",
        backgroundColor: "#333",
        fontSize: "3em",
    };

    return (
        <Layout>
            <Header style={headerStyle}>MyToDoList</Header>
            <AuthBar />
            {isUser() ? (
                <Content>
                    <Row justify="space-evenly">
                        <Col span={6}>
                            <ToDoForm onFinish={onFinish} />
                        </Col>
                        <Col span={17}>
                            <ToDoTable todos={todos} onComplete={onComplete} onDelete={onDelete} />
                        </Col>
                    </Row>
                </Content>
            ) : (
                <div style={{ textAlign: "center" }}>
                    <Title>Oops ...</Title>
                    <Title level={2} style={{ color: "grey" }}>
                        It looks like you do not have the MY-TODO-LIST-USER role!
                    </Title>
                </div>
            )}
        </Layout>
    );
}

export default Home;
