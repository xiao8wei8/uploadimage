import { Upload, Form, Button, message, Card, Modal, List, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import './App.css';
import { useEffect, useState } from 'react';


const { Dragger } = Upload;

function App() {
  const [form] = Form.useForm();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState([]);
  const [imageList, setImageList] = useState([]);

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      console.log('获取文件base64编码:', file.name);
      const reader = new FileReader();
      reader.readAsDataURL(file.originFileObj);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => {
        console.error('获取base64编码失败:', error);
        reject(error);
      };
    });

  const handlePreview = async (file) => {
    console.log('预览图片:', file.name);
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleChange = ({ fileList: newFileList, file, event }) => {
    // 检查是否是删除操作
    if (event && event.type === 'click' && event.currentTarget.classList.contains('ant-upload-list-item-remove')) {
      console.log('删除图片:', file.name);
    }
    // 检查文件状态变化
    if (file.status) {
      console.log('文件状态变化:', file.name, file.status);
    }
    setFileList(newFileList);
  };

  const handleCancel = () => setPreviewOpen(false);

  // 获取服务器上的图片列表
  const fetchImageList = async () => {
    try {
      console.log('获取服务器图片列表');
      const response = await axios.get('http://152.136.175.14:3001/api/images');
      if (response.data.success) {
        console.log('获取图片列表成功:', response.data.images.length, '张图片');
        setImageList(response.data.images);
      } else {
        message.error('获取图片列表失败：' + response.data.message);
      }
    } catch (error) {
      console.error('获取图片列表异常:', error);
      message.error('获取图片列表失败：' + error.message);
    }
  };

  // 删除服务器上的图片
  const handleDeleteServerImage = async (filename) => {
    try {
      console.log('删除服务器图片:', filename);
      const response = await axios.delete(`http://152.136.175.14:3001/api/images/${filename}`);
      
      if (response.data.success) {
        message.success('图片删除成功');
        // 重新获取图片列表
        fetchImageList();
      } else {
        message.error('图片删除失败：' + response.data.message);
      }
    } catch (error) {
      console.error('删除图片异常:', error);
      message.error('图片删除失败：' + error.message);
    }
  };

  // 预览服务器上的图片
  const handlePreviewServerImage = (image) => {
    console.log('预览服务器图片:', image.name);
    setPreviewImage(image.url);
    setPreviewOpen(true);
    setPreviewTitle(image.name);
  };

  // 下载服务器上的图片
  const handleDownloadServerImage = (image) => {
    console.log('下载服务器图片:', image.name);
    try {
      // 创建一个临时链接进行下载
      const link = document.createElement('a');
      link.href = image.url;
      link.download = image.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('图片下载成功');
    } catch (error) {
      console.error('下载图片异常:', error);
      message.error('图片下载失败：' + error.message);
    }
  };

  // 格式化文件大小显示
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  // 组件加载时获取图片列表
  useEffect(() => {
    fetchImageList();
  }, []);

  // 上传成功后刷新图片列表
  const handleUploadSuccess = async () => {
    // 延迟一下再刷新，确保服务器已经处理完上传
    setTimeout(() => {
      fetchImageList();
    }, 500);
  };

  const beforeUpload = (file) => {
    console.log('检查文件格式:', file.name, file.type);
    const isJpgOrPngOrWebp = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
    if (!isJpgOrPngOrWebp) {
      message.error('只支持 JPG/PNG/WEBP 格式的图片!');
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      console.log('文件大小超出限制:', file.name, file.size / 1024 / 1024, 'MB');
      message.error('图片大小必须小于 2MB!');
      return Upload.LIST_IGNORE;
    }
    console.log('文件格式和大小检查通过:', file.name);
    return true;
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );

  const handleSubmit = async () => {
    try {
      console.log('开始提交上传请求');
      // 如果有上传的图片，创建FormData并上传
      if (fileList.length > 0) {
        console.log('待上传文件数量:', fileList.length);
        const formData = new FormData();
        fileList.forEach(file => {
          if (file.originFileObj) {
            formData.append('files', file.originFileObj);
            console.log('添加文件到上传队列:', file.name);
          }
        });

        console.log('发送上传请求到服务器');
        const response = await axios.post('http://152.136.175.14:3001/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('上传请求响应:', response.data);
        if (response.data.success) {
          message.success(`成功上传了 ${response.data.files.length} 张图片`);
          // 清空文件列表
          setFileList([]);
          // 上传成功后刷新图片列表
          handleUploadSuccess();
        } else {
          message.error('上传失败：' + response.data.message);
        }
      } else {
        message.warning('请先选择要上传的图片');
      }
    } catch (error) {
      console.error('上传过程异常:', error);
      message.error('上传失败：' + error.message);
    }
  };

  return (
    <div className="App">
      <h1>图片上传示例</h1>
      <Card style={{ maxWidth: 800, margin: '0 auto 20px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item label="上传图片">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              onPreview={handlePreview}
              multiple
              showUploadList
              customRequest={({ onSuccess, file }) => {
                // 这里我们使用自定义上传逻辑，所以直接调用onSuccess
                setTimeout(() => {
                  console.log('触发自定义上传请求:', file.name);
                  onSuccess("ok");
                }, 0);
              }}
            >
              {fileList.length >= 8 ? null : uploadButton}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              提交并上传
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 显示服务器上的图片列表 */}
      <Card title="已上传图片列表" style={{ maxWidth: 800, margin: '0 auto' }}>
        {imageList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            暂无上传的图片
          </div>
        ) : (
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={imageList}
            renderItem={(image) => (
              <List.Item>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={image.name}
                      src={image.url}
                      style={{ height: 150, objectFit: 'cover' }}
                    />
                  }
                  actions={[
                    <Button
                      key="preview"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreviewServerImage(image)}
                    >
                      预览
                    </Button>,
                    <Button
                      key="download"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownloadServerImage(image)}
                    >
                      下载
                    </Button>,
                    <Popconfirm
                      title="确定要删除这张图片吗？"
                      onConfirm={() => handleDeleteServerImage(image.filename)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        key="delete"
                        icon={<DeleteOutlined />}
                        danger
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  ]}
                  extra={
                    <span style={{ fontSize: 12, color: '#888' }}>
                      {formatSize(image.size)}
                    </span>
                  }
                >
                  <Card.Meta
                    title={
                      <span style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                        {image.name}
                      </span>
                    }
                    description={
                      <span style={{ fontSize: 12, color: '#888' }}>
                        {new Date(image.createdAt).toLocaleString()}
                      </span>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="预览" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
}

export default App;
