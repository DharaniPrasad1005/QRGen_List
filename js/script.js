//Defining a listener for our button, specifically, an onclick handler
document.getElementById("add").onclick = function () {
    //First things first, we need our text:
    var text = document.getElementById("idea").value; //.value gets input values

    //Now construct a quick list element
    var li = text;
    const liNode = document.createTextNode(li);

    //Now use appendChild and add it to the list!
    document.getElementById("list").appendChild(liNode);
    const lineBreak = document.createElement('br');
    document.getElementById("list").appendChild(lineBreak);

}