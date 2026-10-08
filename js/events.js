import { randInt, pick, adjustRep, group, companionsPhrase, pickCompanionName } from './state.js';

/* ===========================================================
   AMBIENTAÇÃO — linhas de clima/hora sorteadas, texto puro
=========================================================== */
export const AMBIENT_LINES = [
  "O céu está cinza há dias, sem sol de verdade.",
  "Um vento seco levanta poeira nas ruas vazias.",
  "Chove fino, do tipo que não parece que vai parar.",
  "O silêncio da noite anterior ainda pesa no ar.",
  "Longe, um som que pode ser trovão — ou não.",
  "O cheiro de fumaça nunca sai de vez.",
  "A lua cheia ilumina mais do que deveria.",
  "Um frio incomum para a época do ano corta o ar.",
  "Passarinhos ainda cantam em algum lugar, como se nada tivesse mudado.",
  "O rádio só pega estática nessa parte da cidade.",
  "Uma névoa baixa cobre a rua inteira pela manhã.",
  "O calor do meio-dia faz tudo parecer mais lento."
];

/* ===========================================================
   ABERTURAS ALEATÓRIAS — cada partida começa em um lugar diferente
=========================================================== */
export const OPENING_EVENTS = [
  { id:"open_casa", icon:"start",
    title:"Dia 1 — O Despertar",
    text:()=>`Você acorda em casa com sirenes distantes. A energia caiu de madrugada. No rádio a pilha, só estática — e um aviso repetido: "Não saia de casa." Mas a água encanada parou e a comida não dura mais que um ou dois dias.`,
    choices:[
      { label:"Arriscar o mercado do bairro, mais perto.", icon:"mercado", effects:{comida:[10,20], saude:[-15,-3]}, consequence:"Voltar com as mãos cheias custou caro, mas você tem o que precisa por enquanto." },
      { label:"Seguir para a mata, mais longe dos outros.", icon:"floresta", effects:{municao:[5,12], comida:[0,8], saude:[-5,2]}, consequence:"A cabana de um caçador rendeu mais do que você esperava." }
    ]
  },
  { id:"open_escritorio", icon:"start",
    title:"Dia 1 — O Despertar",
    text:()=>`Você acorda debaixo da própria mesa, no 12º andar do escritório. Os elevadores estão parados e o prédio inteiro em silêncio. Lá embaixo, sirenes. No bolso, só a garrafa de água que sobrou da última reunião.`,
    choices:[
      { label:"Descer pelas escadas de emergência até o mercado da esquina.", icon:"mercado", effects:{comida:[8,18], saude:[-12,-2]}, consequence:"Doze andares depois, você sai com os braços cheios e as pernas tremendo." },
      { label:"Sair pelos fundos do prédio, rumo ao parque e à mata da cidade.", icon:"floresta", effects:{municao:[4,10], moral:[2,8]}, consequence:"O verde depois de tanto concreto quase parece um alívio." }
    ]
  },
  { id:"open_rodovia", icon:"start",
    title:"Dia 1 — O Despertar",
    text:()=>`Você acorda com a buzina presa de um carro na pista ao lado. O engarrafamento está parado há horas, cercado de veículos vazios e um cheiro de fumaça vindo de algum lugar longe demais para ver.`,
    choices:[
      { label:"Caminhar até o posto de conveniência mais próximo.", icon:"resgate", effects:{comida:[6,14], municao:[2,8]}, consequence:"A loja já foi revirada, mas sobrou mais do que parecia à primeira vista." },
      { label:"Cortar caminho pelo matagal que corre paralelo à pista.", icon:"floresta", effects:{saude:[-8,0], moral:[3,9]}, consequence:"Longe do metal quente e dos carros parados, você respira pela primeira vez em horas." }
    ]
  },
  { id:"open_vizinho", icon:"start",
    title:"Dia 1 — O Despertar",
    text:()=>`Você acorda na sala de um vizinho que mal conhecia — foi até lá ontem à noite, assustado com o barulho, e acabou dormindo no sofá. A casa está vazia agora; um bilhete na mesa diz apenas "fui buscar ajuda".`,
    choices:[
      { label:"Ir atrás de comida no mercado antes que alguém chegue primeiro.", icon:"mercado", effects:{comida:[12,22], saude:[-10,-2]}, consequence:"Você não é o único com essa ideia — mas chega antes dos outros." },
      { label:"Sair pela mata nos fundos, longe de olhos que você não conhece.", icon:"floresta", effects:{municao:[6,12], moral:[-2,4]}, consequence:"Ninguém te vê partir. É melhor assim, você pensa, sem ter certeza." }
    ]
  }
];

/* ===========================================================
   BANCO DE SITUAÇÕES — sorteado a cada dia, sem fim fixo
=========================================================== */
export const EVENTS = [

  /* ---------- BUSCA (lugares) ---------- */
  { id:"farmacia", category:"scavenge", icon:"resgate",
    text:()=>`Uma farmácia de bairro ainda tem a persiana meio aberta.`, title:()=>"A Farmácia",
    choices:[
      { label:"Entrar e pegar o que sobrou no balcão.", effects:{saude:[8,16]}, consequence:"Analgésicos, gaze, um antibiótico vencido mas ainda útil." },
      { label:"Vasculhar o estoque nos fundos — mais demorado, mais arriscado.", effects:{saude:[16,26], comida:[-2,0]}, consequence:"O estoque interno tinha muito mais, mas o barulho lá fora nunca parou de te preocupar." }
    ]
  },
  { id:"postogas", category:"scavenge", icon:"resgate",
    text:()=>`Um posto de gasolina abandonado, a loja de conveniência com a porta emperrada.`, title:()=>"Posto Abandonado",
    choices:[
      { label:"Forçar a porta e entrar.", effects:{comida:[10,18], municao:[0,6], saude:[-6,0]}, consequence:"A porta cede com um estrondo que ecoa longe demais para o seu gosto." },
      { label:"Só pegar o que está visível lá fora.", effects:{comida:[3,8]}, consequence:"Pouco, mas seguro. Você não arrisca o pescoço por uma prateleira." }
    ]
  },
  { id:"fazenda", category:"scavenge", icon:"floresta",
    text:()=>`Uma fazenda isolada no fim da estrada, o galinheiro ainda de pé.`, title:()=>"A Fazenda",
    choices:[
      { label:"Entrar no celeiro em busca de mantimentos.", effects:{comida:[14,24], saude:[-8,0]}, consequence:"Grãos, conservas, uma faca enferrujada mas afiada. Vale o risco do cheiro estranho lá dentro." },
      { label:"Só tirar água limpa do poço.", effects:{saude:[4,10]}, consequence:"Nada de extraordinário, mas água limpa nunca é pouco." }
    ]
  },
  { id:"shopping", category:"scavenge", icon:"mercado",
    text:()=>`Um shopping às escuras, vitrines estilhaçadas refletindo o pouco de luz que entra.`, title:()=>"O Shopping",
    choices:[
      { label:"Ir até a loja de artigos esportivos.", effects:{municao:[6,14], saude:[-10,-2]}, consequence:"Facas de caça e alguns cartuchos perdidos. Cada passo ecoa mais do que deveria." },
      { label:"Passar pela loja de departamento, mais silenciosa.", effects:{comida:[4,10], moral:[2,6]}, consequence:"Roupas secas e um pouco de comida enlatada. Pequenos confortos ainda existem." }
    ]
  },
  { id:"escola", category:"scavenge", icon:"mercado",
    text:()=>`Uma escola vazia, cadeiras viradas, a cantina ainda trancada.`, title:()=>"A Escola",
    choices:[
      { label:"Arrombar a cantina.", effects:{comida:[12,20], saude:[-6,0]}, consequence:"Merenda escolar nunca foi tão bem-vinda." },
      { label:"Só dormir numa sala de aula tranquila.", effects:{saude:[6,12], moral:[3,7]}, consequence:"Os desenhos na parede te lembram de um mundo que já não existe mais assim." }
    ]
  },
  { id:"hospital", category:"scavenge", icon:"resgate",
    text:()=>`Um hospital abandonado. O gerador falhou há dias; o cheiro é ruim mesmo do lado de fora.`, title:()=>"O Hospital",
    choices:[
      { label:"Entrar até a farmácia interna, mais fundo no prédio.", effects:{saude:[18,28], moral:[-6,0]}, consequence:"O que você encontra lá dentro vale a pena — mas vai te assombrar por um tempo." },
      { label:"Passar longe. Não vale o risco.", effects:{moral:[1,4]}, consequence:"Você segue andando. Alguns lugares não merecem ser revistados." }
    ]
  },
  { id:"trem", category:"scavenge", icon:"estrada",
    text:()=>`Um trem de carga parado nos trilhos há dias, vagões enferrujando ao sol.`, title:()=>"O Trem Parado",
    choices:[
      { label:"Abrir os vagões de carga.", effects:{comida:[8,16], municao:[4,10], saude:[-8,-1]}, consequence:"Os trincos cedem com esforço, mas a carga ainda estava intacta lá dentro." },
      { label:"Só descansar num vagão de passageiros.", effects:{saude:[8,14]}, consequence:"Os bancos empoeirados ainda servem para um sono decente." }
    ]
  },
  { id:"biblioteca", category:"scavenge", icon:"radio",
    text:()=>`Uma biblioteca pública, silenciosa como um túmulo, fileiras e fileiras de livros intocados.`, title:()=>"A Biblioteca",
    choices:[
      { label:"Procurar um manual de sobrevivência na seção de referência.", effects:{moral:[6,12], municao:[0,4]}, consequence:"Página por página, você aprende coisas que devia ter aprendido há muito tempo." },
      { label:"Só ler um pouco à luz de vela, sem pressa.", effects:{moral:[8,16], comida:[-3,-1]}, consequence:"Por uma hora, o mundo lá fora quase não existe." }
    ]
  },

  /* ---------- PESSOAS ---------- */
  { id:"comerciante", category:"people", icon:"trade",
    text:(s)=> s.rep.comerciantes >= 12
      ? `O mesmo comerciante de sempre reconhece vocês de longe e já abre um sorriso. "Voltaram", ele diz, arrumando a barraca.`
      : `Um homem monta uma pequena barraca de trocas na beira da estrada, vigiando os arredores.`,
    title:()=>"O Comerciante",
    choices:(s)=>{
      const bonus = s.rep.comerciantes >= 12 ? 4 : 0;
      const list = [
        { label:"Trocar munição por comida.", resolve:(s)=>{ adjustRep(s,"comerciantes",randInt(2,5)); return {effects:{municao:[-8,-4], comida:[10+bonus,18+bonus]}, text: bonus ? "A confiança de outras vezes rende um preço melhor." : "Um bom negócio, ou pelo menos você espera que sim."}; } },
        { label:"Trocar comida por remédio.", resolve:(s)=>{ adjustRep(s,"comerciantes",randInt(2,5)); return {effects:{comida:[-10,-5], saude:[10+bonus,18+bonus]}, text:"Ele nem pergunta de onde veio a comida. Melhor assim."}; } },
        { label:"Não confiar. Seguir andando.", effects:{moral:[-2,2]}, consequence:"Talvez fosse honesto. Talvez não. Você nunca vai saber." }
      ];
      if(s.rep.comerciantes >= 15){
        list.push({ label:"Pedir fiado — ele confia em você agora.", resolve:(s)=>{ adjustRep(s,"comerciantes",-3); return {effects:{comida:[6,12]}, text:"\"Da próxima vez a gente acerta\", ele diz, empurrando um saco de mantimentos."}; } });
      }
      return list;
    }
  },
  { id:"fanatico", category:"people", icon:"desconhecido",
    text:()=>`Uma mulher grita escrituras para ninguém numa esquina vazia, dizendo que o fim é castigo merecido.`, title:()=>"A Pregadora",
    choices:[
      { label:"Ouvi-la em silêncio e seguir em paz.", effects:{moral:[2,6]}, consequence:"Não muda nada, mas por um instante você não se sente tão sozinho quanto ela." },
      { label:"Ignorá-la e apressar o passo.", effects:{}, consequence:"A voz dela ainda ecoa duas ruas depois." },
      { label:"Tentar acalmá-la e trazê-la com você.", condition:(s)=>s.companions.length<3,
        resolve:(s)=>{ const name = pickCompanionName(s); return {effects:{moral:[10,18], comida:[-8,-3]}, text:`Depois de muita conversa, ela aceita seguir com você. Diz se chamar ${name}.`, addCompanionName:name}; } }
    ]
  },
  { id:"sobrevivente_ferido", category:"people", icon:"resgate",
    text:()=>`Um homem ferido está encurralado, cercado por infectados lentos, gritando por ajuda.`, title:()=>"Alguém Precisa de Ajuda",
    condition:(s)=>s.companions.length<3,
    choices:[
      { label:"Arriscar-se para salvá-lo.",
        resolve:(s)=>{ const name = pickCompanionName(s); return {effects:{municao:[-10,-4], saude:[-14,-4], moral:[10,18]}, text:`Vocês conseguem tirá-lo de lá vivo. Ele se apresenta, ainda trêmulo: ${name}.`, addCompanionName:name}; } },
      { label:"Recuar. É arriscado demais para um estranho.", effects:{moral:[-24,-16]}, consequence:"Você ouve os gritos diminuírem enquanto se afasta. Isso vai ficar com você." }
    ]
  },
  { id:"grupo_rival", category:"threat", icon:"rivais",
    text:(s)=> s.rep.andarilhos <= -15
      ? `São eles de novo — o mesmo grupo de Andarilhos de antes. Dessa vez não vêm para negociar; vêm de arma em punho, reconhecendo vocês.`
      : `Um grupo armado bloqueia a passagem adiante, exigindo parte dos seus suprimentos "em troca de segurança".`,
    title:()=>"Passagem Cobrada",
    choices:(s)=>{
      if(s.rep.andarilhos <= -15){
        return [
          { label:"Enfrentar. Não há mais o que negociar.",
            resolve:(s)=>{
              if(s.municao >= 15) return {effects:{municao:[-16,-12], saude:[-20,-12], moral:[-10,-4]}, text:"O confronto é feio, mas vocês saem de pé."};
              return {effects:{municao:[-999,0], saude:[-45,-35], moral:[-12,-6]}, text:"Sem munição, o corpo a corpo é brutal.",
                deathOverride:{title:"Emboscada na Estrada", text:`Os Andarilhos não esqueceram ${s.name}. Dessa vez não houve negociação possível.`}};
            }},
          { label:"Fugir por um caminho mais longo e arriscado.", effects:{comida:[-10,-4], saude:[-12,-6]}, consequence:"Vocês correm mais do que andam, mas escapam." }
        ];
      }
      return [
        { label:"Negociar e ceder parte dos suprimentos.", resolve:(s)=>{ adjustRep(s,"andarilhos",randInt(3,7)); return {effects:{comida:[-16,-10], municao:[-10,-4], moral:[2,6]}, text:"Dói entregar o que custou tanto a conseguir, mas ninguém sangra hoje."}; } },
        { label:"Recusar e desviar por um caminho mais longo.", effects:{comida:[-6,-2], saude:[-8,-2]}, consequence:"O desvio consome horas e energia, mas vocês passam longe deles." },
        { label:"Enfrentar. A passagem é sua.",
          resolve:(s)=>{
            adjustRep(s,"andarilhos",randInt(-25,-15));
            if(s.municao >= 15) return {effects:{municao:[-16,-12], saude:[-18,-10], moral:[-14,-6]}, text:"O confronto é rápido e brutal. Vocês vencem — mas isso muda alguma coisa em você. Os sobreviventes vão lembrar do seu rosto."};
            return {effects:{municao:[-999,0], saude:[-40,-30], moral:[-16,-8]}, text:"Sem munição suficiente, a briga vira corpo a corpo.",
              deathOverride:{title:"Emboscada na Estrada", text:`${s.name} não teve munição suficiente para vencer o confronto. A estrada ficou mais um corpo entre tantos outros.`}};
          }}
      ];
    }
  },
  { id:"crianca_perdida", category:"people", icon:"desconhecido",
    text:(s)=>`Uma criança sozinha observa ${group(s)} de longe. "Meus pais não voltaram", ela diz, sem se aproximar muito.`, title:()=>"Uma Criança Sozinha",
    condition:(s)=>s.companions.length<3,
    choices:[
      { label:"Deixá-la seguir com vocês.",
        resolve:(s)=>{ const name = pickCompanionName(s); return {effects:{moral:[16,24], comida:[-10,-5]}, text:`Ela não solta sua mão pelo resto do dia. Diz se chamar ${name}.`, addCompanionName:name}; } },
      { label:"Dar o que puder e seguir sem ela.", effects:{comida:[-6,-2], moral:[-6,-2]}, consequence:"Você a deixa com o pouco que tem. Não é abandono, você repete para si — mas dói do mesmo jeito." },
      { label:"Dizer que não pode ajudar e seguir andando.", effects:{moral:[-26,-18]}, consequence:"Ela fica parada, olhando vocês se afastarem. Ninguém fala nada pelo resto do dia." }
    ]
  },
  { id:"soldado", category:"people", icon:"rivais",
    text:(s)=> s.rep.milicia >= 12
      ? `Um posto de bloqueio da Milícia — os mesmos de antes. Reconhecem vocês e abaixam as armas primeiro.`
      : `Um soldado sem farda aponta a arma, trêmulo. "Eu só quero ir pra casa", ele diz.`,
    title:()=>"O Desertor",
    choices:(s)=>{
      const list = [
        { label:"Baixar as mãos e deixá-lo em paz.", resolve:(s)=>{ adjustRep(s,"milicia",randInt(2,5)); return {effects:{moral:[3,7]}, text:"Ele abaixa a arma também. Vocês seguem em direções opostas, aliviados."}; } },
        { label:"Tentar convencê-lo a seguir com vocês.", condition:(s)=>s.companions.length<3,
          resolve:(s)=>{ adjustRep(s,"milicia",randInt(3,7)); const name = pickCompanionName(s); return {effects:{municao:[4,10], moral:[6,12]}, text:`Depois de hesitar, ele concorda. Se apresenta como ${name} — e ainda tem munição sobrando.`, addCompanionName:name}; } },
        { label:"Atacar primeiro, sem arriscar.", resolve:(s)=>{ adjustRep(s,"milicia",randInt(-20,-10)); return {effects:{municao:[-8,-4], saude:[-14,-6], moral:[-18,-10]}, text:"Vocês vencem. Isso não parece uma vitória."}; } }
      ];
      if(s.rep.milicia >= 15){
        list.push({ label:"Pedir informações sobre a região.", resolve:(s)=>{ adjustRep(s,"milicia",-2); return {effects:{municao:[3,8], moral:[2,5]}, text:"Eles dividem munição e apontam um caminho mais seguro no mapa."}; } });
      }
      return list;
    }
  },
  { id:"idoso", category:"people", icon:"desconhecido",
    text:()=>`Um senhor sentado na calçada se recusa a sair de casa, mesmo com tudo em ruínas ao redor.`, title:()=>"O Senhor da Esquina",
    choices:[
      { label:"Ajudá-lo a se mudar para um lugar mais seguro.", effects:{moral:[8,14], comida:[-6,-2]}, consequence:"Leva o dia inteiro, mas ele agradece com os olhos molhados." },
      { label:"Deixar mantimentos com ele e seguir.", effects:{comida:[-4,-1], moral:[2,5]}, consequence:"Não é muito, mas é o que dá para fazer sem se atrasar." },
      { label:"Seguir sem olhar para trás.", effects:{moral:[-4,-1]}, consequence:"Você não tem tempo, você repete para si mesmo, andando mais rápido do que precisava." }
    ]
  },

  /* ---------- AMEAÇAS ---------- */
  { id:"horda", category:"threat", icon:"zumbis",
    text:()=>`Um bando de infectados bloqueia a única passagem segura à vista.`, title:()=>"O Bando",
    choices:[
      { label:"Enfrentar com a munição que sobrou.",
        resolve:(s)=>{
          if(s.municao >= 15) return {effects:{municao:[-16,-12], saude:[-12,-6], moral:[4,10]}, text:"Vocês abrem caminho no tiro. Funciona — mas por pouco."};
          return {effects:{municao:[-999,0], saude:[-35,-25], moral:[-8,-2]}, text:"A munição não é suficiente.",
            deathOverride:{title:"Cercado", text:`O bando era grande demais e a munição, pouca demais. ${s.name} não conseguiu abrir caminho a tempo.`}};
        }},
      { label:"Fazer barulho longe dali para desviá-lo.", effects:{comida:[-14,-8], saude:[-6,-2], moral:[2,6]}, consequence:"O desvio funciona, mas custa horas e o pouco que restava de comida." },
      { label:"Esperar escondidos até anoitecer.", effects:{comida:[-18,-12], saude:[2,6]}, consequence:"Vocês esperam em silêncio absoluto. O bando se dispersa com a escuridão." }
    ]
  },
  { id:"perseguidor", category:"threat", icon:"zumbis",
    text:()=>`Um único infectado rasteja atrás de vocês há quarteirões, sem nunca cansar.`, title:()=>"O Perseguidor",
    choices:[
      { label:"Eliminá-lo com um tiro certeiro.", effects:{municao:[-3,-1]}, consequence:"Um estampido, e o silêncio volta. Vale a bala." },
      { label:"Despistar por becos e ruas cruzadas.", effects:{saude:[-6,-2], comida:[-4,-1]}, consequence:"Vocês o perdem de vista depois de um bom tempo correndo." }
    ]
  },
  { id:"tempestade", category:"threat", icon:"storm",
    text:()=>`Uma tempestade forte se forma no horizonte, relâmpagos cortando um céu cor de chumbo.`, title:()=>"A Tempestade",
    choices:[
      { label:"Procurar abrigo imediato.", effects:{saude:[2,6], comida:[-6,-2]}, consequence:"Vocês se enfiam num vão qualquer bem a tempo. A chuva cai com força lá fora." },
      { label:"Seguir andando na chuva.", effects:{saude:[-14,-6]}, consequence:"Vocês chegam encharcados e trêmulos, mas chegam." }
    ]
  },
  { id:"predio", category:"threat", icon:"estrada",
    text:()=>`O prédio ao lado começa a ranger e rachar, uma nuvem de poeira subindo entre os escombros.`, title:()=>"Estrutura Instável",
    choices:[
      { label:"Correr para longe, sem olhar para trás.", effects:{saude:[-6,-2]}, consequence:"O estrondo vem segundos depois. Vocês sentem a poeira nas costas." },
      { label:"Tentar salvar os suprimentos lá dentro primeiro.", effects:{comida:[10,18], municao:[4,10], saude:[-20,-10]}, consequence:"Vocês saem com os braços cheios e os pulmões ardendo de poeira." }
    ]
  },
  { id:"armadilha", category:"threat", icon:"rivais",
    text:()=>`Uma armadilha de arame e latas dispara um alarme quando vocês passam por uma viela estreita.`, title:()=>"Armadilha",
    choices:[
      { label:"Recuar devagar, sem fazer barulho.", effects:{comida:[-4,-1]}, consequence:"Vocês recuam a tempo. Quem montou aquilo nunca aparece." },
      { label:"Correr antes que algo apareça.", effects:{saude:[-10,-4]}, consequence:"Vocês passam pela viela correndo, o coração na garganta." }
    ]
  },

  /* ---------- ABRIGO / DESCANSO ---------- */
  { id:"abrigo_estranhos", category:"rest", icon:"abrigo",
    text:(s)=> s.rep.refugio >= 10
      ? `O mesmo abrigo de outras vezes. Alguém já abre o portão de longe: "Voltaram! Entrem, tem lugar."`
      : `Um abrigo cercado por grades aparece na estrada. Sobreviventes lá dentro acenam — mas alguém do lado de fora avisa que "essa gente rouba tudo que você tiver".`,
    title:()=>"O Abrigo",
    choices:[
      { label:"Confiar e entrar.",
        resolve:(s)=>{
          if(s.rep.refugio >= 10 || s.moral >= 50){
            adjustRep(s,"refugio",randInt(3,7));
            return {effects:{comida:[16,24], municao:[6,12], moral:[6,12]}, text:"Eles dividem o que têm sem pedir nada em troca. Ainda existe gente assim."};
          }
          adjustRep(s,"refugio",randInt(-6,-2));
          return {effects:{comida:[-14,-6], moral:[-14,-6]}, text:"Alguém revista a mochila de vocês durante a noite. Acordam com menos do que entraram."};
        }},
      { label:"Recusar e acampar longe, isolados.", effects:{saude:[6,12], comida:[-10,-4], moral:[-6,-2]}, consequence:"Vocês descansam de verdade, mas a solidão pesa mais a cada dia." },
      { label:"Observar de longe antes de decidir.", effects:{comida:[-6,-2]}, consequence:"Nada de bom ou ruim acontece. Vocês só perdem tempo — e comida." }
    ]
  },
  { id:"igreja", category:"rest", icon:"abrigo",
    text:()=>`Uma igreja de portas abertas, velas ainda acesas no altar, ninguém à vista.`, title:()=>"A Igreja Vazia",
    choices:[
      { label:"Descansar ali por uma noite.", effects:{saude:[8,14], moral:[3,7]}, consequence:"O silêncio ali dentro é diferente do resto da cidade. Quase reconfortante." },
      { label:"Seguir andando, desconfiado de lugares tão convidativos.", effects:{}, consequence:"Talvez fosse só isso mesmo. Você nunca vai saber." }
    ]
  },
  { id:"bunker", category:"rest", icon:"abrigo_noturno",
    text:()=>`Um bunker de quintal, escada de metal descendo no escuro.`, title:()=>"O Bunker",
    choices:[
      { label:"Descer e passar a noite trancados lá dentro.", effects:{saude:[12,20], moral:[-5,-1]}, consequence:"Seguro como poucos lugares, mas o ar parado deixa todos inquietos." },
      { label:"Só verificar por fora e seguir.", effects:{}, consequence:"Melhor não se trancar em buracos que você não conhece." }
    ]
  },

  /* ---------- DILEMAS ---------- */
  { id:"racionar", category:"dilemma", icon:"escassez", condition:(s)=>s.companions.length>0,
    text:(s)=>`A comida está acabando e há mais de uma boca para alimentar.`, title:()=>"Racionar",
    choices:[
      { label:"Dividir igualmente, mesmo sendo pouco.", effects:{comida:[-14,-8], moral:[6,10]}, consequence:"Ninguém reclama. Ninguém come o suficiente, mas ninguém reclama." },
      { label:"Comer menos você mesmo.", effects:{saude:[-10,-4], moral:[8,14]}, consequence:"Seu estômago dói mais que o de todo mundo. Você não conta isso a ninguém." },
      { label:"Dar menos a eles, sem avisar.", effects:{moral:[-16,-8], saude:[2,6]}, consequence:"Ninguém percebe. Você percebe." }
    ]
  },
  { id:"eutanasia", category:"dilemma", icon:"ferido",
    text:()=>`Um estranho mordido, já febril, implora para não virar um deles.`, title:()=>"Um Pedido",
    choices:[
      { label:"Conceder o pedido dele.", effects:{moral:[-6,2]}, consequence:"Você faz o que ele pediu. Não sente nada parecido com alívio." },
      { label:"Recusar e seguir andando.", effects:{moral:[-10,-4]}, consequence:"Você o deixa lá, sozinho com o que está por vir. A escolha te persegue de qualquer jeito." }
    ]
  },
  { id:"roubo_adormecido", category:"dilemma", icon:"escassez",
    text:()=>`Um acampamento estranho dorme perto dali, mantimentos à vista, ninguém de guarda.`, title:()=>"Tentação",
    choices:[
      { label:"Roubar o que der.", effects:{comida:[16,26], moral:[-18,-10]}, consequence:"Funciona. Vocês comem por dias. Ninguém dorme direito depois disso." },
      { label:"Seguir com fome. Não vale a consciência.", effects:{comida:[-8,-3], moral:[6,10]}, consequence:"O estômago vazio dói, mas você ainda reconhece quem é." }
    ]
  },

  /* ---------- PERDA DE COMPANHEIROS ---------- */
  { id:"mordida_companheiro", category:"loss", icon:"loss", condition:(s)=>s.companions.length>0,
    text:(s)=>{ const n = s.companions[randInt(0,s.companions.length-1)]; return `Durante a noite, um som seco de mordida. ${n} foi arranhado por um infectado fazendo guarda — e não conta a ninguém, você percebe pelo jeito que esconde o braço.`; },
    title:()=>"A Mordida",
    choices:[
      { label:"Afastá-lo agora, por segurança.",
        resolve:(s)=>{ const idx = randInt(0,s.companions.length-1); const n = s.companions[idx]; return {effects:{moral:[-24,-14]}, text:`${n} entende, mas a decisão dói nos dois. Fica para trás, sozinho.`, removeCompanionAt:idx}; } },
      { label:"Ficar e cuidar dele, arriscando contágio.", effects:{saude:[-14,-6], moral:[14,22]}, consequence:"Você limpa o ferimento e reza para não ser a próxima. Ele agradece sem palavras." }
    ]
  },
  { id:"discordancia", category:"loss", icon:"loss", condition:(s)=>s.companions.length>0,
    text:(s)=>{ const n = s.companions[randInt(0,s.companions.length-1)]; return `${n} discorda do jeito que você tem liderado o grupo. A tensão vem crescendo há dias.`; },
    title:()=>"Atrito",
    choices:[
      { label:"Deixá-lo ir em paz, se é isso que quer.",
        resolve:(s)=>{ const idx = randInt(0,s.companions.length-1); const n = s.companions[idx]; return {effects:{moral:[-10,-4]}, text:`${n} pega as próprias coisas e parte sozinho pela manhã.`, removeCompanionAt:idx}; } },
      { label:"Insistir para que fique. A discussão fica feia.", effects:{moral:[-6,-2], saude:[-4,0]}, consequence:"Ele fica. O clima entre vocês, não tanto." }
    ]
  },

  /* ---------- FERIMENTOS (sem companheiro) ---------- */
  { id:"ferimento_solo", category:"threat", icon:"ferido", condition:(s)=>s.companions.length===0,
    text:()=>`Escalando uma cerca de arame farpado no escuro, você se machuca fundo na perna. O corte não para de sangrar.`, title:()=>"O Ferimento",
    choices:[
      { label:"Cauterizar o ferimento você mesmo.", effects:{saude:[-12,-6], moral:[2,6]}, consequence:"Dói mais do que quase tudo até agora. Mas fecha." },
      { label:"Usar comida como troca por um curativo improvisado.", effects:{saude:[-4,0], comida:[-10,-6]}, consequence:"Não é o ideal, mas segura o sangramento." }
    ]
  }
];

/* ===========================================================
   MARCOS — texto de passagem de tempo, sem alterar mecânica
=========================================================== */
export const MILESTONES = {
  7:  s=>`Uma semana inteira desde que tudo começou. ${s.name}${companionsPhrase(s) ? " e " + companionsPhrase(s) : ""} ainda ${group(s)==="vocês"?"estão":"está"} de pé.`,
  14: s=>`Duas semanas. O mundo antigo já parece distante — quase inventado.`,
  21: s=>`Três semanas vivo neste mundo novo. Poucos duram tanto.`,
  30: s=>`Um mês. Ao longe, por um instante, ${s.name} jura ver um helicóptero cruzando o céu. Ele não desce. Segue em frente.`,
  45: s=>`Seis semanas. A rotina de sobreviver virou quase um ofício.`,
  60: s=>`Dois meses. ${s.name} já não se lembra direito do som da própria voz antes de tudo isso.`,
  80: s=>`Quase três meses. Muito poucos chegam até aqui.`,
  100:s=>`Cem dias. Um número que ${s.name} nunca imaginou precisar contar.`
};

/* ===========================================================
   SORTEIO DE EVENTOS
=========================================================== */
function categoryWeights(s){
  const day = s.day;
  return {
    scavenge: 5,
    people: 4,
    threat: day < 4 ? 2 : (day < 10 ? 4 : 6),
    rest: 3,
    dilemma: s.companions.length > 0 ? 3 : 1,
    loss: s.companions.length > 0 ? Math.min(1 + Math.floor(day/10), 3) : 0
  };
}

function eventsInCategory(cat, s, allowRecent){
  return EVENTS.filter(e =>
    e.category === cat &&
    (!e.condition || e.condition(s)) &&
    (allowRecent || !s.usedRecent.includes(e.id))
  );
}

export function pickEvent(s){
  const weights = categoryWeights(s);
  const cats = Object.keys(weights).filter(c => weights[c] > 0 && eventsInCategory(c, s, true).length > 0);
  const total = cats.reduce((sum,c)=>sum+weights[c],0);
  let r = Math.random() * total;
  let chosenCat = cats[0];
  for(const c of cats){ if(r < weights[c]){ chosenCat = c; break; } r -= weights[c]; }

  let pool = eventsInCategory(chosenCat, s, false);
  if(!pool.length) pool = eventsInCategory(chosenCat, s, true);
  if(!pool.length) pool = EVENTS.filter(e => !e.condition || e.condition(s));

  const ev = pick(pool);
  s.usedRecent.push(ev.id);
  if(s.usedRecent.length > 8) s.usedRecent.shift();
  return ev;
}
