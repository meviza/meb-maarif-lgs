// Booklet order is down the left column, then down the right column.
// Long tasks reserve a full column; no question is split between pages.
export function packQuestions(questions) {
  const pages=[];
  let columns=[[],[]], column=0, load=0;
  for (const question of questions) {
    const weight=question.layout==='extended'?2:1;
    if (load+weight>2) {
      if (column===0) {column=1;load=0;}
      else {pages.push(columns);columns=[[],[]];column=0;load=0;}
    }
    columns[column].push(question);
    load+=weight;
  }
  if (columns.flat().length) {
    if (columns[1].length===0 && columns[0].length===2) columns[1].push(columns[0].pop());
    pages.push(columns);
  }
  return pages;
}
