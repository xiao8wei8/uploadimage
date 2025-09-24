const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = 3002;


// Hello World路由
app.get('/zhongouupload', (req, res) => {
  res.send('Hello World');
});
// 动态获取的主机名/IP地址
const HOSTNAME = '152.136.175.14'

// 启用CORS
app.use(cors());

// 创建uploads目录（如果不存在）
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// 创建multer实例
const upload = multer({ storage: storage });

// 处理图片上传的路由
app.post('/zhongouapi/upload', (req, res) => {
  // 添加详细的请求日志
  console.log('收到上传请求，检查请求头:', req.headers['content-type']);
  
  // 使用upload.array中间件，但添加try-catch来捕获Multer错误
  upload.array('files')(req, res, (err) => {
    if (err) {
      // 专门处理Multer错误
      console.error('Multer上传错误:', {
        message: err.message,
        code: err.code,
        field: err.field
      });
      
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        // 处理字段名不匹配的错误
        return res.status(400).json({
          success: false,
          message: `上传字段名错误，请使用'files'字段`,
          error: err.message,
          expectedField: 'files',
          receivedField: err.field
        });
      }
      
      return res.status(500).json({
        success: false,
        message: '文件上传处理失败',
        error: err.message
      });
    }
    
    try {
      const files = req.files;
      console.log('文件解析成功，共', files ? files.length : 0, '个文件');
      
      if (!files || files.length === 0) {
        console.log('没有文件被上传');
        return res.status(400).json({
          success: false,
          message: '没有文件被上传',
          tip: '请确保使用正确的字段名"files"'
        });
      }

      // 记录每个上传的文件信息
      files.forEach(file => {
        console.log('上传文件信息:', {
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          filename: file.filename
        });
      });
      
      const uploadedFiles = files.map(file => ({
        name: file.originalname,
        url: `https://www.saifchat.com/zhongouuploads/${file.filename}`,
        baseUrl: `https://www.saifchat.com/zhongouuploads/`,
        size: file.size,
        filename: file.filename
      }));

      console.log('文件上传成功，返回结果');
      res.status(200).json({
        success: true,
        files: uploadedFiles
      });
    } catch (error) {
      console.error('上传处理异常:', error);
      res.status(500).json({
        success: false,
        message: '上传处理过程中发生异常',
        error: error.message
      });
    }
  });
});

// 获取图片列表的路由
app.get('/zhongouapi/images', (req, res) => {
  try {
    console.log('收到获取图片列表请求');
    
    // 读取uploads目录中的所有文件
    const files = fs.readdirSync(uploadDir);
    
    // 获取每个文件的详细信息
    const imageList = files.map(filename => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);
      
      // 从文件名中提取原始文件名（假设文件名格式为：时间戳-原始文件名）
      const originalName = filename.substring(filename.indexOf('-') + 1);
      
      return {
        name: originalName,
        filename: filename,
        url: `http://${HOSTNAME}:${PORT}/uploads/${filename}`,
        baseUrl: `http://${HOSTNAME}:${PORT}`,
        size: stats.size,
        createdAt: stats.ctime
      };
    });
    
    res.status(200).json({
      success: true,
      images: imageList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取图片列表失败', error: error.message });
  }
});

// 删除图片的路由
app.delete('/zhongouapi/images/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    console.log('收到删除图片请求:', filename);
    
    const filePath = path.join(uploadDir, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.log('文件不存在:', filename);
      return res.status(404).json({ success: false, message: '文件不存在' });
    }
    
    // 删除文件
    fs.unlinkSync(filePath);
    console.log('文件删除成功:', filename);
    
    res.status(200).json({
      success: true,
      message: '图片删除成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除图片失败', error: error.message });
  }
});

// 静态文件服务，提供上传的图片
app.use('/zhongouuploads', express.static(uploadDir));

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://${HOSTNAME}:${PORT}`);
});