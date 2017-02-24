# fis3 sftp 部署插件

## 安装

全局安装或者本地安装都可以。

```
npm install fis3-deploy-http-push --save-dev
```

## 使用方法

也可以使用统一的 deploy 插件配置方法

```javascript
fis.match('*.js', {
    deploy: fis.plugin('sftp', {
        //这个参数会跟随post请求一起发送
        to: '/home/fis/www',
        
        // 参考 npm ssh2 的配置
        user: 'xxx',
        password: 'xxx'
    })
})
```
