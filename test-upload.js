const fs = require('fs')
const path = require('path')
const FormData = require('form-data')

async function testUpload() {
  try {
    console.log('Testando upload de imagem...')
    
    // Criar um arquivo de teste
    const testImagePath = path.join(__dirname, 'public', 'images', 'banner', 'BANNER1.png')
    
    if (!fs.existsSync(testImagePath)) {
      console.log('Arquivo de teste não encontrado, criando um arquivo dummy...')
      // Criar um arquivo dummy para teste
      const dummyPath = path.join(__dirname, 'test-dummy.png')
      fs.writeFileSync(dummyPath, 'dummy image data')
      
      const formData = new FormData()
      formData.append('file', fs.createReadStream(dummyPath), {
        filename: 'test-image.png',
        contentType: 'image/png'
      })
      
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      console.log('Resultado do upload:', result)
      
      // Limpar arquivo dummy
      fs.unlinkSync(dummyPath)
    } else {
      console.log('Usando arquivo existente para teste...')
      const formData = new FormData()
      formData.append('file', fs.createReadStream(testImagePath), {
        filename: 'BANNER1.png',
        contentType: 'image/png'
      })
      
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      console.log('Resultado do upload:', result)
    }
    
  } catch (error) {
    console.error('Erro no teste de upload:', error)
  }
}

testUpload()
