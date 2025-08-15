const fs = require('fs')
const path = require('path')

async function testUpload() {
  try {
    console.log('Testando API de upload...')
    
    // Verificar se o arquivo de teste existe
    const testImagePath = path.join(__dirname, 'public', 'images', 'banner', 'BANNER1.png')
    
    if (!fs.existsSync(testImagePath)) {
      console.log('Arquivo de teste não encontrado!')
      return
    }
    
    console.log('Arquivo de teste encontrado:', testImagePath)
    
    // Criar FormData
    const FormData = require('form-data')
    const formData = new FormData()
    
    formData.append('file', fs.createReadStream(testImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    })
    
    console.log('Enviando requisição para /api/upload...')
    
    const response = await fetch('http://localhost:3002/api/upload', {
      method: 'POST',
      body: formData
    })
    
    console.log('Status da resposta:', response.status)
    
    const result = await response.json()
    console.log('Resultado:', result)
    
    if (response.ok) {
      // Verificar se o arquivo foi criado
      const uploadedPath = path.join(__dirname, 'public', result.imageUrl)
      console.log('Verificando arquivo criado:', uploadedPath)
      console.log('Arquivo existe:', fs.existsSync(uploadedPath))
    }
    
  } catch (error) {
    console.error('Erro no teste:', error)
  }
}

testUpload()
