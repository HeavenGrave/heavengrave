// import { SlateTransforms } from '@wangeditor/editor'
var nowUserId;
var myEditId = -1;
var myEdit;
window.onload = function () {
    //获取文档id
    myEditId = parseInt(getParameterByName('myEditId'));
    nowUserId = parseInt(getParameterByName('userId'));
    //创建富文本编辑器
    const {createEditor, createToolbar} = window.wangEditor;
    const editorConfig = {
        placeholder: 'Type here...',
        MENU_CONF: {
            uploadImage: {
                //上传地址
                server: '/img/addImage',
                // form-data fieldName ，默认值 'wangeditor-uploaded-image'
                fieldName: 'file',
                // 单个文件的最大体积限制，默认为 5M
                maxFileSize: 5 * 1024 * 1024, // 5M
                // 最多可上传几个文件，默认为 100
                maxNumberOfFiles: 1,
                // 自定义增加 http  header
                headers: {
                    Content: {
                        type: 'multipart/form-data'
                    }
                },
                // 超时时间，默认为 10 秒
                timeout: 20 * 1000, // 20 秒
                async customUpload(file, insertFn) {                   // JS 语法
                                                                       // file 即选中的文件
                    var formData = new FormData();
                    formData.append('file', file);
                    axios.post('/img/addImage', formData, {
                        async: true,
                        crossDomain: true,
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        processData: false,
                        contentType: false,
                        mimeType: "multipart/form-data",
                        data: formData
                    })
                        .then(res => {
                            console.log(res);
                            console.log(res.data);
                            if (res.status === 200) {
                                let info = res.data;
                                let imageInfo = JSON.parse(info.data);
                                // 最后插入图片
                                if (imageInfo.message === "Upload success.") {
                                    insertFn(imageInfo.data.url);
                                } else {
                                    insertFn(imageInfo.images);
                                }
                            } else {
                                alert("图片上传失败！！！");
                            }
                        })
                        .catch(error => {
                            alert("图片上传时产生未知的异常" + error);
                        });
                }

            }
        },
        // onChange(editor) {
        //     const html = editor.getHtml();
        //     console.log('editor content', html);
        //     // 也可以同步到 <textarea>
        // }
    }

    const editor = createEditor({
        selector: '#editor-container',
        html: '<p><br></p>',
        config: editorConfig,
        mode: 'default', // or 'simple'
    })

    //全屏
    editor.fullScreen();

    const toolbarConfig = {}

    const toolbar = createToolbar({
        editor,
        selector: '#toolbar-container',
        config: toolbarConfig,
        mode: 'default', // or 'simple'
    })
    //回显数据  获取我的文档以及公共文档
    if (myEditId && myEditId !== -1) {
        axios.post('/edit/getMyEdit', "id=" + myEditId)
            .then(res => {
                console.log(res);
                console.log(res.data);
                if (res.status === 200) {
                    let info = res.data;
                    myEdit = info.data;
                    //返回主页
                    editor.setHtml(myEdit.info);
                } else {
                    alert("查询数据失败！！！");
                }
            })
            .catch(error => {
                alert("回显我的文档时产生未知的异常" + error);
            });
    }


    /**
     * 保存信息按钮点击监听
     */
    $("#svae_edit").on('click', function (e) {
        $("#svae_title").css("display", "flex");
        if (myEdit) {
            $("#title").val(myEdit.title);
        }
    });
    /**
     * 保存按钮点击监听
     */
    $("#btn_save").on('click', function (e) {
        let info = editor.getHtml();
        const params = new URLSearchParams();
        params.append('info', info)
        params.append('title', $("#title").val());
        if (myEdit) {
            params.append('myEditId', myEdit.id);
            axios.post('/edit/updateEdit', params)
                .then(res => {
                    console.log(res);
                    console.log(res.data);
                    if (res.status === 200) {
                        //返回主页
                        location.href = "/showEdit?userId=" + nowUserId;
                    } else {
                        alert("保存失败！！！");
                    }
                })
                .catch(error => {
                    alert("保存我的文档时产生未知的异常" + error);
                });
        } else {
            params.append('userId', nowUserId);
            axios.post('/edit/addEdit', params)
                .then(res => {
                    console.log(res);
                    console.log(res.data);
                    if (res.status === 200) {
                        //返回主页
                        location.href = "/showEdit?userId=" + nowUserId;
                    } else {
                        alert("保存失败！！！");
                    }
                })
                .catch(error => {
                    alert("保存我的文档时产生未知的异常" + error);
                });
        }
    })
    /**
     * 取消按钮点击监听
     */
    $("#btn_clear").on('click', function (e) {
        $("#svae_title").css("display", "none");
    });

    /**
     * 返回按钮点击监听
     */
    $("#btn_back").on('click', function (e) {
        if (nowUserId) {
            location.href = "/showEdit?userId=" + nowUserId;
        } else {
            location.href = "/showEdit";
        }
    });

}

/**
 * 根据url获取参数值
 * @param name
 * @returns {string|null}
 */
function getParameterByName(name) {
    name = name.replace(/[[]]/g, '\$&');
    var url = window.location.href;
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }
    return decodeURIComponent(results[2].replace('/+/g', ' '));
}


