# fis3 sftp 部署插件

## 安装

全局安装或者本地安装都可以。

```
npm install fis3-deploy-sftp --save-dev
```

## 使用方法

可以使用统一的 deploy 插件配置方法

```javascript
fis.match('*.js', {
    deploy: fis.plugin('sftp', {
        // sftp路径
        to: '/home/fis/www',
        
        // 参考 npm ssh2 的配置
        host: 'xxx',
        username: 'xxx',
        password: 'xxx'
    })
})
```
