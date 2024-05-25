import React, { useEffect, useState } from 'react'
import { myToDoListApi } from '../components/MyToDoListApi'
import { Layout, Col, Row } from 'antd'
import ToDoForm from './ToDoForm'
import ToDoTable from './ToDoTable'
const { Header, Content } = Layout

function Home() {
    const [todos, setTodos] = useState([])

    useEffect(() => {
        handleToDos()
    }, [])

    const handleToDos = async () => {
        try {
            const response = await myToDoListApi.getToDos()
            setTodos(response.data)
        } catch (error) {
            handleLogError(error)
        }
    }

    const onFinish = async (addToDoRequest) => {
        try {
            await myToDoListApi.addToDo(addToDoRequest)
            await handleToDos()
        } catch (error) {
            handleLogError(error)
        }
    }

    const onComplete = async (key) => {
        try {
            await myToDoListApi.updateToDo(key, true)
            await handleToDos()
        } catch (error) {
            handleLogError(error)
        }
    }

    const onDelete = async (key) => {
        try {
            await myToDoListApi.deleteToDo(key)
            await handleToDos()
        } catch (error) {
            handleLogError(error)
        }
    }

    const handleLogError = (error) => {
        if (error.response) {
            console.log(error.response.data)
        } else if (error.request) {
            console.log(error.request)
        } else {
            console.log(error.message)
        }
    }

    const headerStyle = {
        textAlign: 'center',
        color: '#fff',
        backgroundColor: '#333',
        fontSize: '3em'
    }

    return (
        <Layout>
            <Header style={headerStyle}>MyToDoList</Header>
            <Content>
                <Row justify="space-evenly">
                    <Col span={6}>
                        <ToDoForm
                            onFinish={onFinish}
                        />
                    </Col>
                    <Col span={17}>
                        <ToDoTable
                            todos={todos}
                            onComplete={onComplete}
                            onDelete={onDelete}
                        />
                    </Col>
                </Row>
            </Content>
        </Layout>
    )
}

export default Home