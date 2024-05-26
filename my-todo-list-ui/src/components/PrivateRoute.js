import { useAuth } from "react-oidc-context"
import { Spin, Typography } from 'antd'
const { Title } = Typography

function PrivateRoute({ children }) {
    const auth = useAuth()

    const textAlignStyle = { textAlign: "center" }
    const subTitleStyle = { color: 'grey' }

    if (auth.isLoading) {
        return (
            <div style={textAlignStyle}>
                <Title>Keycloak is loading</Title>
                <Title level={2} style={subTitleStyle}>or running authorization code flow with PKCE</Title>
                <Spin size="large"></Spin>
            </div>
        )
    }

    if (auth.error) {
        return (
            <div style={textAlignStyle}>
                <Title>Oops ...</Title>
                <Title level={2} style={subTitleStyle}>{auth.error.message}</Title>
            </div>
        )
    }

    if (!auth.isAuthenticated) {
        auth.signinRedirect()
        return null
    }

    return children
}

export default PrivateRoute