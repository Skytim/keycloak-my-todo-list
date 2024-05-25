import React from 'react'
import { Typography, Button, Table, Tag } from 'antd'
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons'
const { Title } = Typography

function ToDoTable({ todos, onComplete, onDelete }) {
    const columns = [
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Completed',
            dataIndex: 'completed',
            key: 'completed',
            align: 'center',
        },
        {
            title: 'Complete',
            dataIndex: '',
            key: 'v',
            align: 'center',
            render: (text, record) => (
                <Button
                    icon={<CheckOutlined />}
                    type='primary'
                    shape="circle"
                    onClick={(e) => { onComplete(record.key, e) }}
                >
                </Button>
            ),
        },
        {
            title: 'Delete',
            dataIndex: '',
            key: 'x',
            align: 'center',
            render: (text, record) => (
                <Button
                    icon={<DeleteOutlined />}
                    type='primary'
                    shape="circle"
                    onClick={(e) => { onDelete(record.key, e) }}
                    danger
                >
                </Button>
            ),
        },
    ]

    const dataSource = todos.map(todo => {
        return {
            key: todo.id,
            description: todo.description,
            completed: todo.completed ?
                <Tag color="green">true</Tag> : <Tag color="red">false</Tag>
        }
    })

    return (
        <>
            <Title level={3}>ToDo Table</Title>
            <Table
                dataSource={dataSource}
                columns={columns}
            />
        </>
    )
}

export default ToDoTable