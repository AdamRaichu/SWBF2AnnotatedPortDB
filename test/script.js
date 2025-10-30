/*
  Portions of this code were generated/assisted by [https://gemini.google.com Google Gemini] in addition to AdamRaichu.
*/
$(function () {
  if (!mw.config.get("wgPageName").includes("Calculators/Entity_Port_List")) {
    return;
  }

  const outerContainer = document.getElementById("port_list_container");

  $.getJSON("../generated/ports.min.json", (portlist_defs) => {
    console.log({ portlist_defs });
    const availableEntities = Object.keys(portlist_defs);
    availableEntities.sort();
    outerContainer.innerHTML = `
<div class="container">
    <h1>Entity Port List</h1>
    
    <input id="name-to-add" type="text" list="typenames-list"><button id="add-button">+ Add</button>
    
    <div id="node_container"></div>
    <datalist id="typenames-list"></datalist>
</div>
`;
    // Populate datalist
    const datalist = document.getElementById("typenames-list");
    for (var i = 0; i < availableEntities.length; i++) {
      const opt = document.createElement("option");
      opt.value = availableEntities[i];
      datalist.appendChild(opt);
    }

    // Handle URL loading
    const params = Object.fromEntries(new URLSearchParams(location.search));
    if (typeof params.typename === "string") {
      const desiredTypes = params.typename.split("~");
      const errorType = {
        i: { TypeError: { ct: -1, dt: "", c: "" } },
        c: "The requested entity was not found.",
      };
      for (var i = 0; i < desiredTypes.length; i++) {
        const desiredType = desiredTypes[i];
        if (desiredType === "") continue;
        if (availableEntities.includes(desiredType)) {
          addNode(createEntityNode(desiredType, portlist_defs[desiredType]));
        } else {
          addNode(createEntityNode(desiredType, errorType));
        }
      }
    }

    // Handle manual loading
    const addButton = document.getElementById("add-button");
    const typeInput = document.getElementById("name-to-add");
    addButton.addEventListener("click", () => {
      const desiredType = typeInput.value;
      if (availableEntities.includes(desiredType)) {
        addNode(createEntityNode(desiredType, portlist_defs[desiredType]));
      } else {
        addNode(createEntityNode(desiredType, errorType));
      }
      const params = new URLSearchParams(location.search);
      var typenameParam = params.get("typename");
      if (typenameParam && typenameParam !== "~") {
        typenameParam += "~" + desiredType;
      } else {
        // This is the first item, or the param was empty/invalid
        typenameParam = desiredType;
      }

      params.set("typename", typenameParam);
      const newUrl = `${window.location.pathname}?${params.toString()}`;

      window.history.pushState({ path: newUrl }, "", newUrl);

      // clear input on button click
      typeInput.value = "";
    });
  });
});

/**
 * Appends an EntityNode representation to the correct element.
 * @param {HTMLDivElement} node - The node to append
 */
function addNode(node) {
  document.getElementById("node_container").appendChild(node);
}

/**
 * Maps a connection type (ct) number to its corresponding CSS class.
 * @param {number} ct - The connection type (1: Property, 2: Event, 3: Link).
 * @returns {string} The CSS class name.
 */
function getConnectionTypeClass(ct) {
  switch (ct) {
    case 1:
      return "port-property"; // Property
    case 2:
      return "port-event"; // Event
    case 3:
      return "port-link"; // Link
    default:
      return "port-unknown";
  }
}

/**
 * Get the comment syntax for a port's data type.
 * @param {object} portData - The description of the port.
 * @returns {string} The port's data type prefixed by `#` if documented, `Undocumented` if undocumented.
 */
function getDataType(portData) {
  const typeName = portData.dt;
  if (typeName === "") {
    return portData.ct === 2 ? "#EntityEvent" : "Undocumented";
  } else {
    return "#" + typeName;
  }
}

/**
 * Creates a single port list item (<li>) element.
 * @param {object} portData - The port data object (e.g., { ct: 1, dt: "string", c: "Username" }).
 * @returns {HTMLLIElement} The created <li> element.
 */
function createPortElement(portName, portData) {
  const typeClass = getConnectionTypeClass(portData.ct);

  const li = document.createElement("li");
  li.className = `port ${typeClass}`;

  // Set inner HTML for the port
  li.innerHTML = `
        <span class="port-connector"></span>
        <span class="port-name">${portName}</span>
        <span class="type-declaration-sep">:</span>
        <span class="type-declaration">${processComment(getDataType(portData))}</span>
    `;
  activateTypeLinks(li);
  return li;
}

function activateTypeLinks(element) {
  const linksToLink = element.querySelectorAll("a.type-link");
  for (var i = 0; i < linksToLink.length; i++) {
    const link = linksToLink[i];
    link.href = "https://swbf2frosty.wiki.gg/wiki/Calculators/Type_Explorer?typename=" + link.innerText;
    link.target = "_blank";
  }
}

/**
 * Take a comment and handle magic words.
 * @param {string} comment - The raw comment data.
 * @returns {string} The processed comment as HTML.
 */
function processComment(comment) {
  return comment.replace(/#([A-Za-z]+)/g, '<a class="type-link">$1</a>');
}

function deleteNodeListener() {
  const params = new URLSearchParams(location.search);
  const typenameParam = params.get("typename");

  // BUG FIX: Add a guard for null/empty param to prevent .split() error
  if (!typenameParam) {
    this.parentElement.parentElement.remove(); // Just remove the node visually
    return; // Exit without trying to modify a non-existent URL
  }

  const splitSearch = typenameParam.split("~");
  var i = 0;

  // BUG FIX: Start the search from the .entity-node (this.parentElement.parentElement)
  var child = this.parentElement.parentElement;
  while ((child = child.previousSibling) != null) i++;

  splitSearch.splice(i, 1); // Remove the item at the node's correct index
  var newUrl;
  if (splitSearch.length > 0 && splitSearch.join("~") !== "") {
    params.set("typename", splitSearch.join("~"));
    newUrl = `${window.location.pathname}?${params.toString()}`;
  } else {
    params.delete("typename");
    const newSearch = params.toString();
    newUrl = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname;
  }

  window.history.pushState({ path: newUrl }, "", newUrl);
  this.parentElement.parentElement.remove(); // Remove the node from the DOM
}

/**
 * Creates a complete entity node HTML element from data.
 * @param {string} entityName - The title for the node's header.
 * @param {object} entityDefinition - The object containing 'i' (inputs) and 'o' (outputs).
 * @returns {HTMLDivElement} The complete .entity-node element.
 */
function createEntityNode(entityName, entityDefinition) {
  // 1. Create main container
  const nodeDiv = document.createElement("div");
  nodeDiv.className = "entity-node";

  // 2. Create header
  const headerDiv = document.createElement("div");
  headerDiv.className = "node-header";
  headerDiv.innerHTML = `<h3>${entityName}</h3>`;
  const deleteSpan = document.createElement("span");
  deleteSpan.innerText = " x";
  deleteSpan.addEventListener("click", deleteNodeListener);
  headerDiv.appendChild(deleteSpan);
  nodeDiv.appendChild(headerDiv);

  // 2.5 Create comment holder.
  if (entityDefinition.c.length > 0) {
    const commentPre = document.createElement("pre");
    commentPre.innerHTML = processComment(entityDefinition.c);
    activateTypeLinks(commentPre);
    nodeDiv.appendChild(commentPre);
  }
  if (entityDefinition.c.length > 64) {
    // 64 is arbitrary
    nodeDiv.classList.add("wide-comment");
  }

  // 3. Create body
  const bodyDiv = document.createElement("div");
  bodyDiv.className = "node-body";

  // 4. Create and process inputs
  const inputsDiv = document.createElement("div");
  inputsDiv.className = "node-inputs";
  const inputsUl = document.createElement("ul");
  inputsUl.className = "node-ports-list";

  if (entityDefinition.i) {
    // Iterate over all input ports (keys are hashes)
    Object.keys(entityDefinition.i).forEach((portHash) => {
      const portData = entityDefinition.i[portHash];
      const portEl = createPortElement(portHash, portData);
      inputsUl.appendChild(portEl);
    });
  }
  inputsDiv.appendChild(inputsUl);

  // 5. Create and process outputs
  const outputsDiv = document.createElement("div");
  outputsDiv.className = "node-outputs";
  const outputsUl = document.createElement("ul");
  outputsUl.className = "node-ports-list";

  if (entityDefinition.o) {
    // Iterate over all output ports (keys are hashes)
    Object.keys(entityDefinition.o).forEach((portHash) => {
      const portData = entityDefinition.o[portHash];
      const portEl = createPortElement(portHash, portData);
      outputsUl.appendChild(portEl);
    });
  }
  outputsDiv.appendChild(outputsUl);

  // 6. Assemble body and return
  bodyDiv.appendChild(inputsDiv);
  bodyDiv.appendChild(outputsDiv);
  nodeDiv.appendChild(bodyDiv);

  return nodeDiv;
}
