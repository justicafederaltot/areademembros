'use client'



export default function Banner() {
  return (
                   <section className="relative bg-gradient-to-br from-black to-black py-32 overflow-hidden">
       {/* Background Image */}
       <div 
         className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
         style={{ backgroundImage: 'url(/images/banner/BANNER.png)' }}
       ></div>
       {/* Content Overlay */}
       <div className="relative z-10">
      <div className="container mx-auto px-4">
                 <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-8">
            

            {/* Welcome Message */}
            <div className="space-y-6">
                             <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                 Bem-vindo(a)
               </h2>
              
                                           <p className="text-lg text-gray-300 leading-relaxed">
                Aqui você encontrará tutoriais cuidadosamente preparados para auxiliá-lo(a) na execução das tarefas e rotinas do seu dia a dia de trabalho.
              </p>

              
            </div>
                     </div>

                      {/* Coluna vazia para manter o layout */}
           <div></div>
         </div>
       </div>
       </div>
     </section>
  )
}
