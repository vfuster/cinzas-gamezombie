/* Episódios: situações em 3 atos (começo, meio, fim) com ramificação.
   Cada escolha aponta para o próximo nó via `next`; o nó do ato 3 não tem `next` e encerra o episódio.
   Nós de destino podem ser alcançados por caminhos diferentes — o que muda é como o jogador chegou lá.
   Os nós aceitam as mesmas chaves dos eventos de events.js (effects, consequence, resolve, condition, addCompanionName). */

import { pickCompanionName } from './state.js';

export const EPISODES = [

  /* =====================================================
     O SINAL — uma voz no rádio: salvação ou isca?
  ===================================================== */
  { id:"ep_sinal", name:"O SINAL", start:"a1", nodes:{
    a1:{ act:1, icon:"radio", title:"Ruído no Rádio",
      text:`De madrugada, no meio da estática, uma voz fraca repete coordenadas: "Ponto de encontro antes do rio. Água e comida. Venham em silêncio." Pode ser salvação. Pode ser isca.`,
      choices:[
        { label:"Seguir as coordenadas agora, no escuro.", effects:{saude:[-8,-2], moral:[4,8]}, consequence:"Você caminha às cegas, guiado só pela lembrança de uma voz.", next:"b_estrada" },
        { label:"Esperar o amanhecer e observar de longe.", effects:{comida:[-6,-3], saude:[2,6]}, consequence:"Uma noite longa e sem sono, mas com a cabeça no lugar.", next:"b_colina" },
        { label:"Responder pelo rádio e perguntar quem fala.", effects:{moral:[-3,2]}, consequence:"A voz hesita, corta — e quando volta, já não é a mesma.", next:"b_voz" },
        { label:"Desligar o rádio. Não vale o risco.", effects:{moral:[-4,0], comida:[0,3]}, consequence:"O silêncio volta. Pela manhã, uma coluna de fumaça no horizonte.", next:"b_fumaca" }
      ]},
    b_estrada:{ act:2, icon:"estrada", title:"A Estrada do Rio",
      text:`A estrada corre paralela à água. Há marcas de pneus recentes, uma lanterna apagada no acostamento e, bem à frente, uma luz que oscila como se alguém a balançasse de propósito.`,
      choices:[
        { label:"Seguir pela estrada, em direção à luz.", effects:{moral:[1,5]}, consequence:"Cada passo na brita parece mais alto que o anterior.", next:"c_emboscada" },
        { label:"Contornar pelo mato, longe do asfalto.", effects:{saude:[-6,-1]}, consequence:"Espinhos e lama, mas ninguém te viu.", next:"c_vazio" },
        { label:"Esconder-se e esperar o dia clarear.", effects:{comida:[-5,-2], saude:[3,7]}, consequence:"Quando a luz do sol chega, o cenário parece menos ameaçador.", next:"c_refugio" },
        { label:"Apagar a lanterna e seguir pela margem do rio.", effects:{saude:[-4,0], moral:[0,4]}, consequence:"A água cobre o som dos seus passos. A luz à frente não percebe você chegando.", next:"c_refugio" }
      ]},
    b_colina:{ act:2, icon:"floresta", title:"Vigia na Colina",
      text:`Do alto, você vê o que a voz prometia: barracas, uma fogueira pequena, gente andando devagar. Uma pessoa acena na sua direção — mas você não sabe se é um aceno ou um sinal.`,
      choices:[
        { label:"Descer de mãos ao alto, devagar.", effects:{moral:[2,6]}, consequence:"O aceno era mesmo um aceno.", next:"c_refugio" },
        { label:"Esperar a noite e se aproximar sem ser visto.", effects:{comida:[-4,-1]}, consequence:"Quanto mais perto, menos aquilo se parece com um acampamento.", next:"c_emboscada" },
        { label:"Voltar. Já viu o suficiente.", effects:{moral:[-3,1]}, consequence:"Você se afasta com a sensação de ter deixado algo para trás.", next:"c_vazio" },
        { label:"Gritar de longe e esperar uma resposta.", effects:{moral:[0,4]}, consequence:"Por um instante, todos param. Depois, alguém responde — chamando um nome que não é o seu.", next:"c_emboscada" }
      ]},
    b_voz:{ act:2, icon:"radio", title:"A Segunda Voz",
      text:`A voz agora é outra: uma criança, quase sussurrando. "Estamos no túnel... tem comida... ele não deixa a gente sair." O sinal falha e volta, falha e volta.`,
      choices:[
        { label:"Ir buscar a criança, o mais rápido possível.", effects:{saude:[-6,-1], moral:[3,8]}, consequence:"Você não pensa duas vezes. Talvez devesse ter pensado.", next:"c_emboscada" },
        { label:"Rastrear a origem do sinal com o rádio.", effects:{comida:[-4,-1], moral:[1,4]}, consequence:"Com paciência, o ponteiro leva a algum lugar.", next:"c_vazio" },
        { label:"Responder com coordenadas falsas.", effects:{municao:[-3,0], moral:[2,6]}, consequence:"Uma mentira, para ver quem aparece primeiro.", next:"c_refugio" },
        { label:"Ir até o túnel, mas entrar pelo outro lado.", effects:{saude:[-5,-1], municao:[0,3]}, consequence:"O túnel tem duas bocas. Você escolhe a que ninguém espera.", next:"c_refugio" }
      ]},
    b_fumaca:{ act:2, icon:"resgate", title:"Fumaça ao Amanhecer",
      text:`A fumaça sobe reta, fina demais para um incêndio. Alguém acendeu aquilo de propósito — para ser visto, ou para ver quem vem.`,
      choices:[
        { label:"Ir até lá e descobrir.", effects:{saude:[-5,0], moral:[2,6]}, consequence:"Você anda até o meio-dia sem encontrar ninguém no caminho.", next:"c_refugio" },
        { label:"Ficar escondido o dia inteiro.", effects:{comida:[-7,-3]}, consequence:"Uma tarde longa, com fome e sem notícias.", next:"c_vazio" },
        { label:"Tentar o rádio de novo.", effects:{moral:[-2,2]}, consequence:"Só estática. Mas você jura ouvir respiração por baixo dela.", next:"c_emboscada" },
        { label:"Dar a volta e chegar pelo lado do rio.", effects:{saude:[-3,0], comida:[-3,0]}, consequence:"Pelo rio, você vê o lugar antes que ele te veja.", next:"c_vazio" }
      ]},
    c_refugio:{ act:3, icon:"abrigo", title:"Fogueira e Vozes",
      text:`Eram reais: sete pessoas ao redor de uma fogueira baixa, um cachorro magro, panelas, risos abafados. Uma mulher te estende uma caneca sem perguntar nada.`,
      choices:[
        { label:"Pedir para ficar o tempo que for.", effects:{saude:[10,18], comida:[8,14], moral:[10,18]}, consequence:"Comida quente, um colchão no chão e a primeira noite de sono de verdade em dias.", addCompanionName:true },
        { label:"Trocar o que tem e seguir sozinho.", effects:{comida:[8,14], municao:[4,9], moral:[2,6]}, consequence:"Ninguém insiste. Cada um sabe o peso do que carrega." },
        { label:"Contar sobre o que viu na estrada e ajudar a vigiar.", effects:{comida:[4,8], moral:[6,12]}, consequence:"Sua informação vale mais do que você imaginava." },
        { label:"Comer, agradecer e partir antes do amanhecer.", effects:{comida:[4,8], saude:[3,7], moral:[-3,1]}, consequence:"Ninguém te impede. Talvez você tenha deixado para trás o melhor lugar que encontraria." }
      ]},
    c_emboscada:{ act:3, icon:"rivais", title:"Luzes Demais",
      text:`Não era salvação. Lanternas acendem de todos os lados ao mesmo tempo. "Larga a mochila", diz uma voz calma demais. O rádio, no bolso, ainda chia baixinho.`,
      choices:[
        { label:"Correr para o escuro.", effects:{saude:[-16,-6], comida:[-6,-2]}, consequence:"Um tiro passa perto da orelha. Você só para de correr quando as pernas negam." },
        { label:"Entregar a munição e implorar.", effects:{municao:[-14,-6], moral:[-12,-5]}, consequence:"Eles levam o que pediram e mais um pouco. Você sai vivo, e é só isso." },
        { label:"Reagir com tudo.", effects:{municao:[-10,-5], saude:[-18,-8], moral:[6,12]}, consequence:"Você abre caminho a custo de sangue. Algo dentro de você se endurece." },
        { label:"Ligar o rádio no volume máximo e jogá-lo longe.", effects:{saude:[-8,-2], moral:[2,6]}, consequence:"As lanternas se viram para o barulho por um segundo. Um segundo é o suficiente." }
      ]},
    c_vazio:{ act:3, icon:"desconhecido", title:"O Ponto Vazio",
      text:`Ninguém. Só uma mochila rasgada, latas abertas, cinzas ainda mornas e um caderno com uma frase riscada várias vezes: "NÃO CONFIE NA VOZ."`,
      choices:[
        { label:"Pegar o que der e sair depressa.", effects:{comida:[5,11], municao:[0,5]}, consequence:"Pouca coisa, mas é sua." },
        { label:"Ler o caderno inteiro, página por página.", effects:{moral:[-6,2], municao:[2,6]}, consequence:"Alguém tentou avisar. Você entende tarde demais — e a tempo." },
        { label:"Acampar ali mesmo e descansar.", effects:{saude:[6,12], comida:[-6,-3]}, consequence:"O vazio, ao menos, não ameaça." },
        { label:"Deixar um aviso seu no caderno e partir.", effects:{moral:[4,9]}, consequence:`Embaixo da frase riscada, você escreve outra: "O RIO É SEGURO DE DIA."` }
      ]}
  }},

  /* =====================================================
     A TEMPESTADE — o céu fecha e é preciso abrigo
  ===================================================== */
  { id:"ep_tempestade", name:"A TEMPESTADE", start:"a1", nodes:{
    a1:{ act:1, icon:"storm", title:"O Céu Fecha",
      text:`O vento muda de repente e o céu escurece em minutos. Primeiro gotas grossas, depois uma parede de água. A estrada vira rio e a visibilidade some.`,
      choices:[
        { label:"Correr até a casa mais próxima.", effects:{saude:[-5,-1]}, consequence:"Você chega encharcado, mas com um teto à vista.", next:"b_casa" },
        { label:"Procurar o viaduto que viu mais cedo.", effects:{saude:[-6,-2]}, consequence:"A chuva bate de lado. Você segue de cabeça baixa.", next:"b_viaduto" },
        { label:"Montar um abrigo improvisado com a lona.", effects:{comida:[-4,-1], moral:[1,4]}, consequence:"Mãos tremendo, nós improvisados — mas segura por enquanto.", next:"b_lona" },
        { label:"Continuar andando sob a chuva.", effects:{saude:[-9,-4], moral:[1,5]}, consequence:"Parar parece pior do que andar. Você acaba chegando a algum lugar.", next:"b_viaduto" }
      ]},
    b_casa:{ act:2, icon:"abrigo", title:"A Casa Trancada",
      text:`A porta está trancada por dentro. Pela janela, um vulto se mexe devagar. Pode ser um morador. Pode ser outra coisa.`,
      choices:[
        { label:"Arrombar a porta dos fundos.", effects:{saude:[-5,0], moral:[0,4]}, consequence:"A fechadura cede com um estalo seco.", next:"c_porao" },
        { label:"Bater e chamar em voz alta.", effects:{moral:[1,5]}, consequence:"Um silêncio longo, e depois o som de trancas se abrindo.", next:"c_velho" },
        { label:"Dormir na varanda, protegido do pior.", effects:{saude:[-3,3], comida:[-4,-1]}, consequence:"A madrugada traz um barulho diferente: água demais.", next:"c_enchente" },
        { label:"Entrar pela janela do andar de cima.", effects:{saude:[-6,-2], municao:[0,4]}, consequence:"A calha range, mas aguenta. Lá dentro, um quarto seco — e passos subindo a escada.", next:"c_velho" }
      ]},
    b_viaduto:{ act:2, icon:"estrada", title:"Sob o Viaduto",
      text:`Debaixo do concreto, o barulho da chuva vira um rugido surdo. Há restos de uma fogueira apagada, cobertores jogados e, mais adiante, a água arrastando entulho e corpos.`,
      choices:[
        { label:"Dividir o espaço com os estranhos que já estão lá.", effects:{moral:[2,7]}, consequence:"Ninguém sorri, mas ninguém te manda embora.", next:"c_velho" },
        { label:"Atravessar o rio improvisado, antes que suba mais.", effects:{saude:[-10,-3]}, consequence:"A correnteza puxa, mas você chega do outro lado.", next:"c_enchente" },
        { label:"Explorar um carro abandonado no acostamento.", effects:{comida:[2,7], municao:[0,4]}, consequence:"Dentro do porta-luvas, mais do que esperava.", next:"c_porao" },
        { label:"Subir até a pista de cima e esperar lá.", effects:{saude:[-4,0], moral:[-2,2]}, consequence:"Lá em cima o vento é pior, mas a água ainda não chega. Ainda.", next:"c_enchente" }
      ]},
    b_lona:{ act:2, icon:"floresta", title:"Noite Molhada",
      text:`A lona segura, mas o frio entra pelas costuras. Seus dentes batem. Sem fogo, a noite vai ser longa e a febre pode chegar antes do amanhecer.`,
      choices:[
        { label:"Arriscar acender um fogo pequeno.", effects:{saude:[1,6], moral:[3,8], comida:[-3,-1]}, consequence:"A chama sobrevive. O brilho atrai alguém.", next:"c_velho" },
        { label:"Ficar quieto até a chuva passar.", effects:{saude:[-8,-2], moral:[-4,0]}, consequence:"Uma noite péssima. Pela manhã, o chão sumiu debaixo d'água.", next:"c_enchente" },
        { label:"Abandonar a lona e buscar abrigo de verdade.", effects:{saude:[-5,-1], moral:[1,4]}, consequence:"Entre os relâmpagos, você enxerga uma porta de ferro no chão.", next:"c_porao" },
        { label:"Comer o que resta para manter o corpo quente.", effects:{comida:[-8,-4], saude:[4,8]}, consequence:"O estômago cheio esquenta mais do que você imaginava. De manhã, você enxerga uma porta de ferro no chão.", next:"c_porao" }
      ]},
    c_porao:{ act:3, icon:"abrigo_noturno", title:"O Porão",
      text:`Uma escada estreita leva a um porão seco, cheirando a madeira velha. Prateleiras com potes, um colchão, e uma vela já meio gasta. Alguém morou aqui — e não deixou nada trancado.`,
      choices:[
        { label:"Ficar ali até a tempestade passar.", effects:{saude:[10,18], moral:[6,12]}, consequence:"Pela primeira vez em dias, você dorme sem um olho aberto." },
        { label:"Levar o que der e voltar à estrada.", effects:{comida:[10,18], municao:[2,7], saude:[-4,0]}, consequence:"Os potes de conserva pesam, mas pesam bem." },
        { label:"Vasculhar o canto mais escuro.", effects:{municao:[6,12], moral:[-6,0], saude:[-6,-1]}, consequence:"Algo ali não queria ser encontrado. Você encontra mesmo assim." },
        { label:"Deixar um sinal na porta para outros sobreviventes.", effects:{moral:[6,12], comida:[2,6]}, consequence:"Um X de giz na porta de ferro. Quem vier depois vai saber que é seguro." }
      ]},
    c_velho:{ act:3, icon:"trade", title:"O Velho do Lampião",
      text:`Um homem de barba branca surge com um lampião e uma cadeira dobrável. "Faz tempo que não vejo gente viva", ele diz. Tem um fogão a lenha em algum lugar atrás dele. E uma manta.`,
      choices:[
        { label:"Aceitar a manta e a sopa, e ouvir as histórias.", effects:{saude:[8,14], comida:[6,12], moral:[8,14]}, consequence:"Ele fala mais do que ouve. Você não se importa." },
        { label:"Oferecer munição em troca de abrigo.", effects:{municao:[-6,-3], saude:[10,18], moral:[2,6]}, consequence:"Ele não pede nada, mas aceita. Sabe o que vale." },
        { label:"Convidá-lo a seguir viagem com você.", effects:{moral:[6,12], comida:[-4,-1]}, consequence:"Ele ri, balança a cabeça, e depois pega a mochila.", addCompanionName:true },
        { label:"Desconfiar da gentileza e ir embora de madrugada.", effects:{moral:[-4,0], comida:[2,6]}, consequence:`Você sai sem fazer barulho. Na porta, ele deixou um pão embrulhado e um bilhete: "Boa sorte."` }
      ]},
    c_enchente:{ act:3, icon:"storm", title:"A Água Sobe",
      text:`A água passa dos tornozelos e sobe como se tivesse pressa. Móveis flutuam, e algo maior se arrasta debaixo dela. Não há tempo para pensar duas vezes.`,
      choices:[
        { label:"Subir ao telhado e esperar.", effects:{saude:[-6,-1], moral:[-2,4]}, consequence:"A noite no telhado é uma eternidade. Mas sobe só até ali." },
        { label:"Nadar para a terra firme com tudo.", effects:{saude:[-14,-6], comida:[-8,-3]}, consequence:"Metade das coisas ficam pelo caminho. Você, não." },
        { label:"Largar a mochila e correr.", effects:{comida:[-12,-6], municao:[-8,-3], saude:[-3,2]}, consequence:"Viver custa caro. Você paga e segue." },
        { label:"Agarrar-se a uma porta e deixar a correnteza levar.", effects:{saude:[-10,-4], moral:[2,6], comida:[0,4]}, consequence:"A correnteza te leva a uma rua mais alta, junto com uma caixa de enlatados." }
      ]}
  }},

  /* =====================================================
     O ESTRANHO — um desconhecido se aproxima do acampamento
  ===================================================== */
  { id:"ep_estranho", name:"O ESTRANHO", start:"a1", nodes:{
    a1:{ act:1, icon:"desconhecido", title:"Passos no Escuro",
      text:`No fim da tarde, um homem surge na estrada com uma mochila grande e um andar arrastado. Levanta uma das mãos devagar, como quem pede permissão. Atrás dele, nada. Pelo menos nada que dê para ver.`,
      choices:[
        { label:"Apontar a arma e mandar parar.", effects:{municao:[-2,0], moral:[-2,2]}, consequence:"Ele para. Não levanta a voz. Isso é bom ou ruim.", next:"b_tenso" },
        { label:"Acenar de volta e deixá-lo chegar.", effects:{moral:[1,5]}, consequence:"Você abaixa a guarda só um pouco.", next:"b_conversa" },
        { label:"Esconder-se e observar.", effects:{saude:[0,3]}, consequence:"Algo no andar dele não bate com o que ele diz com o corpo.", next:"b_observa" },
        { label:"Oferecer comida antes de qualquer pergunta.", effects:{comida:[-6,-3], moral:[4,8]}, consequence:"Ele aceita sem fazer cerimônia. E sem agradecer.", next:"b_conversa" }
      ]},
    b_tenso:{ act:2, icon:"rivais", title:"Mãos ao Alto",
      text:`"Sozinho", ele repete, "juro". Mas você ouve um galho estalar atrás dele, e o homem não se vira. Ou é muito bom em esconder, ou muito bom em mentir.`,
      choices:[
        { label:"Revistar a mochila dele.", effects:{municao:[1,5], moral:[-4,0]}, consequence:"Um mapa dobrado, uma faca, um pacote de bolachas.", next:"c_segredo" },
        { label:"Mandá-lo embora sem conversa.", effects:{moral:[-5,0]}, consequence:"Ele vai, sem protestar. Mas olha para trás duas vezes.", next:"c_traicao" },
        { label:"Abaixar a arma e ouvi-lo.", effects:{moral:[3,8]}, consequence:"Ele respira fundo. Parece, de repente, muito mais velho.", next:"c_aliado" },
        { label:"Atirar para o alto e ver quem sai da mata.", effects:{municao:[-3,-1], moral:[0,4]}, consequence:"Uma garota sai da mata de mãos para cima. Ele fecha os olhos, derrotado.", next:"c_aliado" }
      ]},
    b_conversa:{ act:2, icon:"trade", title:"Conversa à Fogueira",
      text:`Ele conta que perdeu o grupo há três dias e que carrega algo que "vale mais do que parece". Tem um corte sujo no braço que tenta esconder, e olha demais para a sua mochila.`,
      choices:[
        { label:"Ajudar a limpar o ferimento.", effects:{saude:[-4,0], moral:[4,9]}, consequence:"Ele fecha os olhos enquanto você trabalha. Quase sorri.", next:"c_aliado" },
        { label:"Trocar informações sem dar nada de graça.", effects:{moral:[0,4]}, consequence:"Ele sabe de lugares. Você sabe de outros.", next:"c_segredo" },
        { label:"Fingir dormir e vigiar a noite toda.", effects:{saude:[-6,-2], comida:[-3,0]}, consequence:"Durante a madrugada, os dedos dele se aproximam da sua mochila.", next:"c_traicao" },
        { label:"Perguntar o que ele carrega de tão valioso.", effects:{moral:[1,5]}, consequence:"Ele hesita, depois tira um papel dobrado do bolso interno do casaco.", next:"c_segredo" }
      ]},
    b_observa:{ act:2, icon:"floresta", title:"Dois Vultos",
      text:`Quando o estranho se afasta, outro vulto sai da mata e se junta a ele. Os dois conversam baixo, apontando para o seu abrigo. Ainda não sabem que você está olhando.`,
      choices:[
        { label:"Emboscar os dois antes que ajam.", effects:{municao:[-5,-1], saude:[-8,-2], moral:[2,7]}, consequence:"Rápido e sujo. Funcionou, mais ou menos.", next:"c_traicao" },
        { label:"Seguir os dois sem ser visto.", effects:{comida:[-4,-1], moral:[2,5]}, consequence:"Eles levam você exatamente para onde queriam levar outro.", next:"c_segredo" },
        { label:"Recuar em silêncio e deixar o abrigo.", effects:{comida:[-3,0], moral:[-3,1]}, consequence:"Nem todo risco merece ser corrido.", next:"c_aliado" },
        { label:"Aparecer e chamar os dois para conversar.", effects:{moral:[2,6], municao:[-2,0]}, consequence:"Eles se assustam mais do que você. Isso diz muito sobre eles.", next:"c_aliado" }
      ]},
    c_aliado:{ act:3, icon:"abrigo", title:"Um Novo Rosto",
      text:`O estranho já não parece estranho. Divide a água, conserta a sua mochila, fala baixo. À noite, pergunta se pode seguir junto. "Sozinho a gente dura pouco", diz.`,
      choices:[
        { label:"Aceitar. Dois vigiam melhor que um.", effects:{moral:[10,18], saude:[3,8]}, consequence:"Fica combinado sem mais palavras.", addCompanionName:true },
        { label:"Aceitar, mas só até a próxima cidade.", effects:{moral:[4,9], comida:[-3,0]}, consequence:"Um acordo prático, sem promessas." },
        { label:"Recusar. Ele que siga o caminho dele.", effects:{moral:[-4,0], comida:[2,6]}, consequence:"Você divide metade do que tem e segue sozinho." },
        { label:"Pedir que ele prove a lealdade numa vigília.", effects:{saude:[4,9], moral:[2,6]}, consequence:"Ele monta guarda a noite inteira. De manhã, você dorme como não dormia há dias." }
      ]},
    c_traicao:{ act:3, icon:"loss", title:"A Mochila Leve",
      text:`Quando você acorda, o estranho não está mais lá. Nem a sua mochila. Há pegadas pequenas e um pedaço de pano rasgado preso num galho.`,
      choices:[
        { label:"Ir atrás dele, rápido.", effects:{saude:[-8,-2], comida:[4,10], moral:[2,8]}, consequence:"Você o alcança. Pega de volta o que importa." },
        { label:"Deixar para lá. Perda é perda.", effects:{comida:[-8,-3], municao:[-4,0], moral:[-8,-2]}, consequence:"Alguns dias são assim. Você vira a página, sem querer." },
        { label:"Reconstruir o que dá com o que sobrou.", effects:{moral:[3,8], saude:[-3,0]}, consequence:"O que sobra é suficiente. Tem que ser." },
        { label:"Montar uma armadilha para o caso de ele voltar.", effects:{municao:[-2,0], moral:[0,6], comida:[0,4]}, consequence:"Ele volta na noite seguinte. Sai correndo e deixa para trás metade do que levou." }
      ]},
    c_segredo:{ act:3, icon:"final", title:"O Mapa Dobrado",
      text:`No mapa, um círculo a lápis marca um lugar chamado "Refúgio Norte". Dois dias de caminhada. Ele jura que é real; você não sabe se acredita. Mas é a primeira indicação concreta em semanas.`,
      choices:[
        { label:"Ir direto, pelo caminho mais curto.", effects:{saude:[-8,-2], moral:[8,14]}, consequence:"Esperança dá força, mas não tira o cansaço." },
        { label:"Ir devagar, cuidando de cada passo.", effects:{comida:[-8,-4], saude:[3,8], moral:[4,9]}, consequence:"Cada noite no caminho é uma noite que você aguenta." },
        { label:"Guardar o mapa e decidir depois.", effects:{moral:[-3,3]}, consequence:"Às vezes uma promessa vale mais guardada do que cumprida." },
        { label:"Trocar o mapa por mantimentos com o próximo grupo.", effects:{comida:[8,14], moral:[-4,0]}, consequence:"A esperança dos outros enche a sua mochila. A sua própria, nem tanto." }
      ]}
  }},

  /* =====================================================
     A HORDA — um mar de infectados atravessa a região
  ===================================================== */
  { id:"ep_horda", name:"A HORDA", start:"a1", nodes:{
    a1:{ act:1, icon:"zumbis", title:"Gemidos ao Longe",
      text:`Primeiro é o chão, vibrando de leve. Depois o som: centenas de gargantas gemendo ao mesmo tempo, vindo do leste. Uma horda inteira atravessa a região — e você está bem no caminho.`,
      choices:[
        { label:"Ficar parado e deixar passar.", effects:{moral:[-3,1]}, consequence:"Segurar o fôlego se torna um esporte.", next:"b_quieto" },
        { label:"Fazer barulho para atraí-los para longe.", effects:{municao:[-3,0], moral:[1,5]}, consequence:"Funciona rápido demais, e isso preocupa.", next:"b_isca" },
        { label:"Fugir pela mata.", effects:{saude:[-5,-1], comida:[-3,0]}, consequence:"Galhos arranham o rosto e o chão engole os passos.", next:"b_fuga" },
        { label:"Subir num telhado e esperar.", effects:{saude:[-3,0], moral:[0,3]}, consequence:"De cima, o mundo parece pequeno e apinhado.", next:"b_quieto" }
      ]},
    b_quieto:{ act:2, icon:"mercado", title:"Respire Devagar",
      text:`Você se enfia entre as prateleiras de um mercado. Pelos vãos da persiana, pés arrastando, sombras demais para contar. Uma lata cai de uma prateleira, perto de onde você está.`,
      choices:[
        { label:"Ficar imóvel e rezar.", effects:{moral:[-4,0]}, consequence:"A lata rola, rola... e para.", next:"c_passou" },
        { label:"Escapar pelos fundos agora.", effects:{saude:[-6,-1]}, consequence:"Os fundos estão trancados. Você os abre, com barulho.", next:"c_cerco" },
        { label:"Arremessar algo longe para distrair.", effects:{comida:[-4,-1], moral:[1,5]}, consequence:"Um frasco estilhaça longe dali. Os gemidos mudam de direção.", next:"c_barricada" },
        { label:"Subir pelo forro do teto.", effects:{saude:[-5,-1], moral:[0,4]}, consequence:"O gesso estala sob o seu peso, mas segura.", next:"c_passou" }
      ]},
    b_isca:{ act:2, icon:"estrada", title:"Ruído",
      text:`Num carro abandonado, a buzina ainda funciona. Perto da igreja em ruínas, o sino pende de uma corda. E sua arma, no cinto, é o barulho mais alto que você tem.`,
      choices:[
        { label:"Acionar a buzina do carro.", effects:{moral:[2,6]}, consequence:"O som rasga a tarde. Eles viram, todos de uma vez.", next:"c_barricada" },
        { label:"Dar um tiro para o alto.", effects:{municao:[-5,-2], moral:[0,4]}, consequence:"O estalo ecoa por quilômetros. Alguns vêm. Muitos vêm.", next:"c_cerco" },
        { label:"Tocar o sino da igreja.", effects:{saude:[-3,0], moral:[3,7]}, consequence:"Um som antigo, quase bonito, na hora errada.", next:"c_passou" },
        { label:"Atear fogo num carro velho.", effects:{municao:[-2,0], saude:[-4,0], moral:[2,6]}, consequence:"A fumaça preta sobe alto. Eles vão em direção ao fogo como mariposas.", next:"c_barricada" }
      ]},
    b_fuga:{ act:2, icon:"floresta", title:"Correndo",
      text:`Os galhos açoitam o rosto e a respiração falha. Atrás, o barulho cresce e se divide: alguns te seguem, outros cortam caminho pelo lado. Há um rio à frente, uma árvore grossa, e uma clareira aberta.`,
      choices:[
        { label:"Pular no rio e deixar a correnteza levar.", effects:{saude:[-6,-1], comida:[-4,-1]}, consequence:"Água gelada, corpo dormente, mas longe deles.", next:"c_passou" },
        { label:"Subir na árvore mais alta.", effects:{saude:[-4,0], moral:[-2,2]}, consequence:"As mãos escorregam, mas você chega ao galho.", next:"c_cerco" },
        { label:"Virar e lutar na clareira.", effects:{municao:[-8,-3], saude:[-8,-3], moral:[4,9]}, consequence:"Com as costas contra uma pedra, é uma luta que você escolhe.", next:"c_barricada" },
        { label:"Esconder-se num tronco oco e esperar.", effects:{saude:[-3,0], moral:[-4,0]}, consequence:"Pés passam a centímetros do seu rosto. Nenhum para.", next:"c_passou" }
      ]},
    c_passou:{ act:3, icon:"desconhecido", title:"Depois que Passam",
      text:`Quando o último gemido some, o silêncio parece mais pesado que o barulho. A rua está coberta de entulho e poeira. Alguns corpos ficaram para trás — e o que eles carregavam também.`,
      choices:[
        { label:"Vasculhar os rastros deixados.", effects:{comida:[6,12], municao:[2,7], saude:[-6,-1]}, consequence:"Dá nojo. Mas o que sobrou é útil." },
        { label:"Ficar escondido mais um tempo.", effects:{saude:[4,9], comida:[-4,-1]}, consequence:"A paciência é uma arma, também." },
        { label:"Seguir o caminho por onde eles vieram.", effects:{moral:[4,9], comida:[2,7]}, consequence:"Eles deixam uma estrada limpa, o que é estranho." },
        { label:"Marcar o caminho da horda num mapa.", effects:{moral:[3,8], municao:[0,3]}, consequence:"Saber onde eles estão é quase tão bom quanto estar longe deles." }
      ]},
    c_cerco:{ act:3, icon:"zumbis", title:"Cercado",
      text:`Não tem mais para onde correr. Eles surgem de três lados, mãos esticadas, olhos vazios. Um instante de pânico — e depois uma clareza estranha, quase fria.`,
      choices:[
        { label:"Abrir caminho a tiros.", effects:{municao:[-12,-6], saude:[-10,-3], moral:[3,8]}, consequence:"Os cartuchos se vão rápido, mas a saída se abre." },
        { label:"Procurar um beco estreito onde só um passe por vez.", effects:{saude:[-12,-5], moral:[2,7]}, consequence:"Um a um, o beco te custa caro, mas o caminho fica livre." },
        { label:"Largar a mochila como distração e correr.", effects:{comida:[-12,-5], municao:[-6,-2], saude:[-4,0]}, consequence:"Metade da mochila, meio mundo perdido, uma vida inteira ganha." },
        { label:"Subir num carro e esperar que percam o interesse.", effects:{saude:[-8,-2], comida:[-6,-2], moral:[-4,2]}, consequence:"Horas em cima do capô, cercado de mãos. Ao amanhecer, eles se dispersam." }
      ]},
    c_barricada:{ act:3, icon:"abrigo_noturno", title:"Barricada",
      text:`A horda desvia e se arrasta por outro lado, e você ganha minutos preciosos. Há uma loja com porta de ferro, um estacionamento fechado, uma escada de incêndio. Algo para trancar. Algo para segurar.`,
      choices:[
        { label:"Reforçar a loja com o que houver à mão.", effects:{comida:[-3,0], saude:[6,12], moral:[5,10]}, consequence:"Os móveis fazem o trabalho. À noite, nada passa." },
        { label:"Seguir viagem aproveitando a distração.", effects:{comida:[3,8], saude:[-4,0]}, consequence:"Passos rápidos, ouvidos atentos, nenhuma pausa." },
        { label:"Procurar mais gente dentro das casas ao redor.", effects:{moral:[6,12], saude:[-5,-1]}, consequence:"Há mais gente viva do que parecia — e agora, menos solitária.", addCompanionName:true },
        { label:"Atrair a horda para longe e voltar depois.", effects:{saude:[-6,-1], municao:[-4,0], moral:[3,8]}, consequence:"Você os leva até a beira da cidade e volta por outro caminho, exausto e inteiro." }
      ]}
  }}
];

const BY_ID = Object.fromEntries(EPISODES.map(e => [e.id, e]));

/* Devolve um nó como evento pronto para a UI. */
export function getEpisodeNode(epId, nodeId){
  const ep = BY_ID[epId];
  const n = ep && ep.nodes[nodeId];
  if(!n) return null;
  return { ...n, id: `${epId}:${nodeId}`, episode: epId, epName: ep.name, nodeId };
}

export function startEpisode(ep){ return getEpisodeNode(ep.id, ep.start); }

/* `addCompanionName:true` vira um nome sorteado; `next` é preservado. */
export function resolveCompanion(choice, s){
  return choice.addCompanionName === true ? pickCompanionName(s) : (choice.addCompanionName || null);
}
