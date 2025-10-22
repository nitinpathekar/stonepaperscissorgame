 (function(){
      const moves=['rock','paper','scissors'];
      const beats={rock:'scissors',paper:'rock',scissors:'paper'};
      const buttons=document.querySelectorAll('.btn');
      const scoreUser=document.getElementById('score-user');
      const scoreCpu=document.getElementById('score-cpu');
      const scoreDraw=document.getElementById('score-draw');
      const resultEl=document.getElementById('result');
      const log=document.getElementById('log');
      const bestOf=document.getElementById('bestOf');
      const difficulty=document.getElementById('difficulty');
      const noise=document.getElementById('noise');
      const reset=document.getElementById('reset');
      const undo=document.getElementById('undo');
      const roundsEl=document.getElementById('rounds');
      const statusText=document.getElementById('statusText');

      let state={user:0,cpu:0,draw:0,rounds:0,history:[],past:[]};

      function addLog(text){
        const p=document.createElement('p');p.textContent=text;log.prepend(p);
      }

      function cpuChoose(){
        const diff=difficulty.value;const rnd=parseFloat(noise.value);
        // If random difficulty -> pick uniformly
        if(diff==='random') return moves[Math.floor(Math.random()*3)];

        // frequency predictor: find user's most frequent move and counter it
        const counts={rock:0,paper:0,scissors:0};
        for(const h of state.history) counts[h]++;
        const most = Object.keys(counts).reduce((a,b)=>counts[a]>=counts[b]?a:b);

        // sequence predictor (simple k-gram: look for last 2 moves)
        if(diff==='history' && state.history.length>=2){
          const key = state.history.slice(-2).join('|');
          // find occurrences of that key and the following move
          const nextCounts={rock:0,paper:0,scissors:0};
          for(let i=0;i<state.history.length-2;i++){
            if(state.history[i]+ '|' + state.history[i+1] === key){
              nextCounts[state.history[i+2]]++;
            }
          }
          const total = nextCounts.rock+nextCounts.paper+nextCounts.scissors;
          if(total>0){
            const predicted = Object.keys(nextCounts).reduce((a,b)=>nextCounts[a]>=nextCounts[b]?a:b);
            // with some randomness
            if(Math.random()>rnd) return counter(predicted);
          }
        }

        // fallback to frequency prediction
        if(Math.random() > rnd){
          return counter(most);
        } else {
          return moves[Math.floor(Math.random()*3)];
        }
      }

      function counter(move){
        // returns the move that beats `move`
        if(move==='rock') return 'paper';
        if(move==='paper') return 'scissors';
        return 'rock';
      }

      function decide(u,c){
        if(u===c) return 'draw';
        if(beats[u]===c) return 'win';
        return 'lose';
      }

      function highlightBtns(userMove,cpuMove,outcome){
        buttons.forEach(b=>b.classList.remove('primary','anim-win','anim-lose','anim-draw'));
        const um = document.querySelector('.btn[data-move="'+userMove+'"]');
        const cm = document.querySelector('.btn[data-move="'+cpuMove+'"]');
        if(outcome==='win'){um.classList.add('anim-win'); cm.classList.add('anim-lose')}
        else if(outcome==='lose'){um.classList.add('anim-lose'); cm.classList.add('anim-win')}
        else {um.classList.add('anim-draw'); cm.classList.add('anim-draw')}
      }

      function play(userMove){
        const cpuMove = cpuChoose();
        const outcome = decide(userMove,cpuMove);

        state.rounds++;
        state.history.push(userMove);
        state.past.push({user:userMove,cpu:cpuMove,outcome:outcome});

        if(outcome==='win') state.user++;
        else if(outcome==='lose') state.cpu++;
        else state.draw++;

        scoreUser.textContent=state.user;scoreCpu.textContent=state.cpu;scoreDraw.textContent=state.draw;roundsEl.textContent=state.rounds;

        resultEl.textContent = `You played ${userMove.toUpperCase()} — CPU played ${cpuMove.toUpperCase()} — ${outcome.toUpperCase()}`;
        addLog(`#${state.rounds}: You ${userMove} — CPU ${cpuMove} → ${outcome}`);
        highlightBtns(userMove,cpuMove,outcome);
        statusText.textContent = `Last: ${userMove} vs ${cpuMove} — ${outcome}`;

        checkBestOf();
      }

      function checkBestOf(){
        const winsNeeded = Math.ceil(parseInt(bestOf.value)/2);
        if(state.user>=winsNeeded || state.cpu>=winsNeeded){
          // game over
          if(state.user>state.cpu) resultEl.textContent = `You won the match ${state.user} — ${state.cpu}`;
          else if(state.cpu>state.user) resultEl.textContent = `CPU won the match ${state.cpu} — ${state.user}`;
          else resultEl.textContent = `Match ended in a tie ${state.user} — ${state.cpu}`;
          statusText.textContent = 'Match finished — reset to play again.';
        }
      }

      buttons.forEach(b=>b.addEventListener('click',()=>{
        if(parseInt(bestOf.value) && (state.user>=Math.ceil(bestOf.value/2) || state.cpu>=Math.ceil(bestOf.value/2))){
          addLog('Match already finished — reset to start a new match.');return;
        }
        play(b.dataset.move);
      }));

      // keyboard support
      window.addEventListener('keydown',e=>{
        if(e.key.toLowerCase() === 'r') document.querySelector('.btn[data-move=rock]').click();
        if(e.key.toLowerCase() === 'p') document.querySelector('.btn[data-move=paper]').click();
        if(e.key.toLowerCase() === 's') document.querySelector('.btn[data-move=scissors]').click();
      });

      reset.addEventListener('click',()=>{
        state={user:0,cpu:0,draw:0,rounds:0,history:[],past:[]};
        scoreUser.textContent='0';scoreCpu.textContent='0';scoreDraw.textContent='0';roundsEl.textContent='0';
        resultEl.textContent='Make your move!';log.innerHTML='';statusText.textContent='Ready';
        buttons.forEach(b=>b.classList.remove('anim-win','anim-lose','anim-draw'));
      });

      undo.addEventListener('click',()=>{
        if(state.past.length===0) { addLog('Nothing to undo'); return }
        const last = state.past.pop();
        // revert counts and history
        state.history.pop();state.rounds--;
        if(last.outcome==='win') state.user--; else if(last.outcome==='lose') state.cpu--; else state.draw--;
        scoreUser.textContent=state.user;scoreCpu.textContent=state.cpu;scoreDraw.textContent=state.draw;roundsEl.textContent=state.rounds;
        addLog(`Undid last round: You ${last.user} — CPU ${last.cpu} (${last.outcome})`);
        resultEl.textContent='Last move undone.';statusText.textContent='Undid last round.';
      });

      // Accessibility: allow focus + enter
      buttons.forEach(b=>b.addEventListener('keydown',e=>{ if(e.key==='Enter' || e.key===' ') b.click(); }));

      // small helpful demo moves to populate history
      addLog('Welcome! Use R / P / S keys or click a button to play.');
    })();