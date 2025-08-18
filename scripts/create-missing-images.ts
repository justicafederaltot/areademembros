import { copyFile, access } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

async function createMissingImages() {
  try {
    console.log('Verificando e criando imagens que estão faltando...')
    
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    
    // Mapeamento de imagens que estão faltando para imagens que existem
    const imageMapping = {
      'audiencia.png': 'CAPA RPV.png',
      'triagem.png': 'SENTENÇA.png',
      'PERÍCIAS.png': 'CAPA RPV.png',
      'SENTENÇA CRIMINAL.png': 'SENTENÇA.png',
      'analise.png': 'CAPA RPV.png',
      'CAPA SENTENÇA.png': 'SENTENÇA.png'
    }
    
    for (const [missingImage, existingImage] of Object.entries(imageMapping)) {
      const missingPath = join(uploadsDir, missingImage)
      const existingPath = join(uploadsDir, existingImage)
      
      // Verificar se a imagem que está faltando já existe
      try {
        await access(missingPath)
        console.log(`✅ ${missingImage} já existe`)
        continue
      } catch {
        // A imagem não existe, vamos criá-la
      }
      
      // Verificar se a imagem de origem existe
      if (!existsSync(existingPath)) {
        console.log(`❌ Imagem de origem não encontrada: ${existingImage}`)
        continue
      }
      
      try {
        // Copiar a imagem existente com o novo nome
        await copyFile(existingPath, missingPath)
        console.log(`✅ Criada: ${missingImage} (cópia de ${existingImage})`)
      } catch (error) {
        console.error(`❌ Erro ao criar ${missingImage}:`, error)
      }
    }
    
    console.log('\n✅ Processo concluído!')
    
  } catch (error) {
    console.error('Erro ao criar imagens:', error)
  }
}

createMissingImages()
