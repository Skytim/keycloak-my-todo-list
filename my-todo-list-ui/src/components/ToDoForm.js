import React from 'react'
import { Typography, Form, Input, Button } from 'antd'
const { Title } = Typography

function ToDoForm({ onFinish }) {
    return (
        <>
            <Title level={3}>Add ToDo</Title>
            <Form
                name="basic"
                autoComplete="off"
                onFinish={onFinish}
            >
                <Form.Item
                    label="Description"
                    name="description"
                    rules={[{ required: true, message: 'Please write the description!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        shape="round"
                        htmlType="submit"
                    >
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </>
    )
}

export default ToDoForm