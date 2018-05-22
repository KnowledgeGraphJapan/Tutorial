/* created by Shusaku Egami (http://idease.info/profile/) */

$(function() {
  var nodes = new vis.DataSet();
  var edges = new vis.DataSet();

  var allNodes = [];
  var allEdges = [];

  function clear() {
    allNodes = [];
    allEdges = [];
    nodes.clear();
    edges.clear();
    network.redraw();
  }

  function getData(endpoint, sparql) {
    clear();
    let url = endpoint + "?query=" + encodeURIComponent(sparql);
    $.ajax({
      url: url,
      type: "GET",
      headers: {
	Accept: "application/sparql-results+json"
      },
      success: function(data) {
	let bindings = data.results.bindings;
	i = 0;
	console.log(bindings);
	while(i < bindings.length) {
	  let s = bindings[i]["s"]["value"];
	  s = s.replace(/http\:\/\/challenge\.knowledge\-graph\.jp\//g,"");
	  s = s.replace(/data\/dataset1\//g,"");
	  let p = bindings[i]["p"]["value"];
	  p = p.replace(/http\:\/\/www\.w3\.org\/2000\/01\/rdf\-schema#/, "rdfs:");
	  p = p.replace(/http\:\/\/challenge\.knowledge\-graph\.jp\/ontology\/kgrc\.owl#/, "kgrc-p:");
	  let o = bindings[i]["o"]["value"];
	  let oType = bindings[i]["o"]["type"];

	  o = o.replace(/http\:\/\/challenge\.knowledge\-graph\.jp\//g,"");
	  o = o.replace(/data\/dataset1\//g,"");
	  let nodeS = nodes.get(s);
	  if(nodeS == undefined) {
	    allNodes.push({id: s, label: s, shape: "dot", size: 7, color: { border: "#2B7CE9", background: "#D2E5FF"}});
	  }
	  let nodeO = undefined;
	  if(oType == "uri") {
	    nodeO = nodes.get(o);
	  } else {
	    nodeO = nodes.get(o + "literal");
	  }
	  if(nodeO == undefined) {
	    if(oType == "uri") {
	      allNodes.push({id: o, label: o, shape: "dot", size: 7, color: { border: "#2B7CE9", background: "#D2E5FF"}})
	    } else {
	      if(o != "") {//日本語または英語ラベルがない場合は表示しない
		allNodes.push({id: o + "literal", label: o, title: o,  shape: "box", color: { background: "rgba(255,255,255,0.7)"}});
	      }
	    }
	  }
	  if(oType == "uri") {
	    allEdges.push({from: s, to: o, title: p, arrows: {to: {enabled: true}}});
	  } else {
	    allEdges.push({from: s, to: o + "literal", title: p, arrows: {to: {enabled: true}}});
	  }
	  i=(i+1)|0;
	}
	console.log(allNodes.length);
	nodes.update(allNodes);
	edges.update(allEdges);

        network.setOptions( { physics: true } );
	network.redraw();
      }
    });
  }

  function highlight(text) {
    nodes.update(allNodes);
    edges.update(allEdges);
    network.redraw();
    let items = nodes.get({
      filter: function(item) {
	return item.label.includes(text);
      }
    });
    let hits = items.slice();
    let i = 0;
    while(i < hits.length) {
      hits[i].color = "#F6a610";
      i=(i+1)|0;
    }
    nodes.update(hits);
  }

  let container = document.getElementById('mynetwork');
  let data = {
    nodes: nodes,
    edges: edges
  };
  let options = {
    edges: {
      smooth: false
    },
    physics: {
      solver: "forceAtlas2Based",
      maxVelocity: 200,
      stabilization: {
	enabled: true,
	iterations: 1000,
	updateInterval: 25
      }
    },
    interaction: {
      hover:true,
      dragNodes: true,
      zoomView: true,
      dragView: true
    }
  };
  var network = new vis.Network(container, data, options);

  /* event handler */

  network.on("doubleClick", function () {
        network.setOptions( { physics: false } );
  });

  $(document).on("click", "#load", function() {
    let sparql = $("#sparql").val();
    let endpoint = $("#endpoint").val();
    getData(endpoint, sparql);
  });

  $(document).on("click", "#search", function() {
    let text = $("#search_text").val();
    highlight(text);
  });

  $(document).on("click", "#clear", function() {
    clear();
  });

  $(document).on("click", "#stop", function() {
    network.setOptions( { physics: false } );
  });

  /* event handler end */

});
