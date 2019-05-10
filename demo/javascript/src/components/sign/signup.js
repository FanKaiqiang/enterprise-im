var React = require("react");
var UI = require('../common/webim-demo');

var Input = UI.Input;
var Button = UI.Button;
var submiting = false;

module.exports = React.createClass({
    keyDown: function (e) {
        if (e && e.keyCode === 13) {
            this.signup();
        }
    },

    signin: function () {
        this.props.update({
            signIn: true,
            signUp: false,
            chat: false
        });
    },

    submiting: false,
    signup: function () {
        var me = this;

        if (this.submiting) {
            return false;
        }

        var username = this.refs.name.refs.input.value;
        var pwd = this.refs.auth.refs.input.value;
        var nickname = this.refs.nickname.refs.input.value;

        if (!username || !pwd) {
            Demo.api.NotifyError(Demo.lan.notEmpty);
            return false;
        }


        this.submiting = true;

        var options = {
            username: username.toLowerCase(),
            password: pwd,
            nickname: nickname,
            appKey: this.props.config.appkey,
            apiUrl: this.props.config.apiURL,
            success: function () {
                me.submiting = false;
                Demo.api.NotifySuccess(Demo.lan.signUpSuccessfully);
                setTimeout(function () {
                    me.props.update({
                        signIn: true,
                        signUp: false,
                        chat: false
                    });
                }, 1000);
            },
            error: function (e) {
                me.submiting = false;
                Demo.api.NotifyError(e.data || "registerUser error! Please check the network and try again!");
            }
        };
        if (WebIM.config.isWindowSDK) {
            var appDir = "";
            if (WebIM.config.appDir) {
                appDir = WebIM.config.appDir;
            }
            var imIP = "";
            if (WebIM.config.imIP) {
                imIP = WebIM.config.imIP;
            }
            var imPort = "";
            if (WebIM.config.imPort) {
                imPort = WebIM.config.imPort;
            }
            var restIPandPort = "";
            if (WebIM.config.restIPandPort) {
                restIPandPort = WebIM.config.restIPandPort;
            }
            WebIM.doQuery('{"type":"createAccount","id":"' + options.username + '","password":"' + options.password
                + '","appDir":"' + appDir + '","appKey":"' + WebIM.config.appkey + '","imIP":"' + imIP + '","imPort":"' + imPort + '","restIPandPort":"' + restIPandPort + '"}', function (response) {
                    options.success();
                },
                function (code, msg) {
                    me.submiting = false;
                    alert("registerUser:" + code + " - " + msg);
                });
        } else {
            Demo.conn.registerUser(options);
        }
    },

    render: function () {
        return (
            <div className={this.props.show ? 'webim-sign webim-signup' : 'webim-sign webim-signup hide'}>
                {/* 判断是否显示注册界面 */}
                <h2>{"注册"}</h2>
                <Input ref='name' placeholder={"用户名"} defaultFocus='true' keydown={this.keyDown}/>
                <Input ref='auth' placeholder={"密码"} type='password' keydown={this.keyDown}/>
                <div className={WebIM.config.isWindowSDK ? 'hide' : ''}>
                    <Input ref='nickname' placeholder={"昵称"} keydown={this.keyDown}/>
                </div>
                <Button text={"注册"} onClick={this.signup}/>
                {/* 表单结构 */}
                <p>{"已有账号"},
                    <i onClick={this.signin}>{"现在登录"}</i>
                </p>
                {/* 跳转至登录界面 */}
            </div>
        );
    }
});
