var React = require("react");
var Notify = require('../common/notify');
var UI = require('../common/webim-demo');

var Input = UI.Input;
var Button = UI.Button;
var Checkbox = UI.Checkbox;

module.exports = React.createClass({
    getInitialState: function () {
        return {
            pageLimit: 8
        };
    },

    keyDown: function (e) {
        if (e && e.keyCode === 13) {
            this.login();
        }
    },

    login: function () {
        var username = this.refs.name.refs.input.value || (WebIM.config.autoSignIn ? WebIM.config.autoSignInName : '');
        var auth = this.refs.auth.refs.input.value || (WebIM.config.autoSignIn ? WebIM.config.autoSignInPwd : '');
        var type = this.refs.token.refs.input.checked;
        this.signin(username, auth, type);
    },

    signin: function (username, auth, type) {
        var username = username;
        var auth = auth;
        var type = type;

        if (!username || !auth) {
            Demo.api.NotifyError(Demo.lan.notEmpty);
            return false;
        }

        var options = {
            apiUrl: this.props.config.apiURL,
            user: username.toLowerCase(),
            pwd: auth,
            accessToken: auth,
            appKey: this.props.config.appkey,
            success: function (token) {
                var encryptUsername = btoa(username);
                encryptUsername = encryptUsername.replace(/=*$/g, "");
                var token = token.access_token;
                var url = '#username=' + encryptUsername;
                WebIM.utils.setCookie('webim_' + encryptUsername, token, 1);
                window.location.href = url
                Demo.token = token;
            },
            error: function () {
                window.location.href = '#'

            }
        };

        if (!type) {
            delete options.accessToken;
        }
        if (Demo.user) {
            if (Demo.user != username) {
                Demo.chatRecord = {};
            }
        }

        Demo.user = username;

        this.props.loading('show');

        Demo.conn.autoReconnectNumTotal = 0;

        if (WebIM.config.isWindowSDK) {
            var me = this;
            if (!WebIM.config.appDir) {
                WebIM.config.appDir = "";
            }
            if (!WebIM.config.imIP) {
                WebIM.config.imIP = "";
            }
            if (!WebIM.config.imPort) {
                WebIM.config.imPort = "";
            }
            if (!WebIM.config.restIPandPort) {
                WebIM.config.restIPandPort = "";
            }
            WebIM.doQuery('{"type":"login","id":"' + options.user + '","password":"' + options.pwd
                + '","appDir":"' + WebIM.config.appDir + '","appKey":"' + WebIM.config.appkey + '","imIP":"' + WebIM.config.imIP + '","imPort":"' + WebIM.config.imPort + '","restIPandPort":"' + WebIM.config.restIPandPort + '"}', function (response) {
                    Demo.conn.onOpened();
                },
                function (code, msg) {
                    me.props.loading('hide');
                    Demo.api.NotifyError('open:' + code + " - " + msg);
                });
        } else {
            Demo.conn.open(options);
        }
    },

    signup: function () {
        this.props.update({
            signIn: false,
            signUp: true,
            chat: false
        });
    },

    componentWillMount: function () {//组件加载前检测Cookie内容
        var uri = WebIM.utils.parseHrefHash();
        var username = uri.username;
        var auth = WebIM.utils.getCookie()['webim_' + username];
        Demo.token = auth;
        if (username && auth) {
            username = atob(username);
            this.signin(username, auth, true);
        }
    },

    componentDidMount: function () {//组件加载完成后检测是否需要自动登录
        if (WebIM.config.autoSignIn) {
            this.refs.button.refs.button.click();
        }
    },

    render: function () {//组件渲染

        return (
            <div className={this.props.show ? 'webim-sign' : 'webim-sign hide'}>
                <h2>{"登录"}</h2>
                <Input placeholder={"用户名"} defaultFocus='true' ref='name' keydown={this.keyDown}/>
                <Input placeholder={"密码"} ref='auth' type='password' keydown={this.keyDown}/>
                {/* 两个输入框 */}
                <div className={WebIM.config.isWindowSDK ? 'hide' : ''}>
                    <Checkbox text={"使用登陆令牌登录"} ref='token'/>
                </div>
                <Button ref='button' text={"登录"} onClick={this.login}/>
                {/* 登录按钮 */}
                <p>{"没有账号"},
                    <i onClick={this.signup}>{"现在注册"}</i>
                </p>
                {/* 跳转到注册页面 */}
            </div>
        );
    }
});
