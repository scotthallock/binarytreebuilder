/**
 * Definition for a binary tree node.
 */
class TreeNode {
    constructor (val, left, right) {
        this.val = (val===undefined ? 0 : val);
        this.left = (left===undefined ? null : left);
        this.right = (right===undefined ? null : right);
    }
}

/**
 * @param {Array} arr 
 * @returns {TreeNode}
 */
const buildTreeFromArray = (arr) => {
    const root = new TreeNode(arr.shift());
    const queue = [root];
    while(queue.length > 0 && arr.length > 0) {
        const currNode = queue.shift();
        const leftVal = arr.shift();
        const rightVal = arr.shift();

        // support both null elements and empty (undefined) elements
        if (leftVal !== null && leftVal !== undefined) {
            currNode.left = new TreeNode(leftVal);
            queue.push(currNode.left);
        }
        if (rightVal !== null && rightVal !== undefined) {
            currNode.right = new TreeNode(rightVal);
            queue.push(currNode.right);
        }
    }
    return root;
};


/**
 * @param {TreeNode} root
 * @returns {}
 */
const renderTreeGraphic = (root) => {
    if (root === null) return;

    const MIN_HORIZ_DIST = 50; // horizontal distance between nodes at max depth
    const dy = 100;
    const treeDepth = maxDepth(root);

    const displaySVG = d3.select('#svg-display');
    displaySVG.selectAll('*').remove(); // clear contents
    displaySVG.append('g')
        .attr('id', 'svg-tree');
    const treeSVG = d3.select('#svg-tree');

    const displayWidth = displaySVG.node().getBoundingClientRect().width;


    // BFS traverse through tree and create SVG elements
    const queue = [[root, 1, displayWidth / 2, dy, 's']]; // [node, depth, x, y, pathID]
    while (queue.length > 0) {
        const [node, depth, x, y, pathID] = queue.shift();

        // calculate horizontal offset of child nodes
        // pixel distance between nodes at deepest point in tree
        // will be equal to MIN_HORIZ_DIST
        const dx = (Math.pow(2, treeDepth - 1) * MIN_HORIZ_DIST) / Math.pow(2, depth);

        let nodeClasses = 'node'; // coloration of nodes
        if (node.left) {
            drawNodeBranchSVG(treeSVG, x, y, x-dx, y+dy);
            queue.push([node.left, depth+1, x-dx, y+dy, pathID+'l']);
        } else {
            nodeClasses += ' no-left';
            drawNewNodeAreaSVG(treeSVG, x, y, x-dx, y+dy, pathID+'l');
        }
        if (node.right) {
            drawNodeBranchSVG(treeSVG, x, y, x+dx, y+dy);
            queue.push([node.right, depth+1, x+dx, y+dy, pathID+'r']);
        } else {
            nodeClasses += ' no-right';
            drawNewNodeAreaSVG(treeSVG, x, y, x+dx, y+dy, pathID+'r');
        }
        drawNodeCircleSVG(treeSVG, x, y, nodeClasses, pathID);
        drawNodeValueSVG(treeSVG, x, y, node.val);
    }
    centerTreeHorizontally(treeSVG, displaySVG); // center the tree in the display

    // Event Listeners
    d3.selectAll('.new-node-area')
        .on('click', e => {
            insertNodeInTree(e.target);
        });
    d3.selectAll('.node')
        .on('mouseup', e => {
            if (e.which === 1) {
                displayEditNodeValueField(e.target);
            } else if (e.which === 3) {
                deleteNodeInTree(e.target);
            }
        });
};

const drawNodeCircleSVG = (svg, x, y, nodeClasses, pathID) => {
    svg.append('circle')
        .attr('class', nodeClasses)
        .attr('id', pathID)
        .attr('r', 20) // fixed 20px radius
        .attr('cx', x)
        .attr('cy', y);
};

const drawNodeValueSVG = (svg, x, y, val) => {
    svg.append('text')
        .attr('class', 'node-val')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle') // horizontally center text in node
        .attr('dy', '7') // y offset text so it appears in center of node
        .text(val);
};

const drawNodeBranchSVG = (svg, x1, y1, x2, y2) => {
    svg.append('line')
        .attr('class', 'branch')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2);
};

const drawNewNodeAreaSVG = (svg, x1, y1, x2, y2, id) => {
    const group = svg.append('g')
        .attr('class', 'new-node-area')
        .attr('id', id);
    group.append('line')
        .attr('class', 'branch new-branch')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2);
    group.append('circle')
        .attr('class', 'node new-node')
        .attr('r', 20)
        .attr('cx', x2)
        .attr('cy', y2);
};

const centerTreeHorizontally = (tree, display) => {
    const treeRect = tree.node().getBoundingClientRect();
    const treeCenter = treeRect.x + treeRect.width / 2;
    const displayRect = display.node().getBoundingClientRect();
    const displayCenter = displayRect.x + displayRect.width / 2;
    tree.attr('transform', `translate(${displayCenter - treeCenter}, 0)`)
};

const insertNodeInTree = (target, val = 0) => {
    let pathID = target.id;
    let node = binaryTreeRoot;
    // remove first character 's'
    pathID = pathID.slice(1);

    while (pathID.length > 1) {
        if (pathID[0] === 'l')
            node = node.left;
        else if (pathID[0] === 'r')
            node = node.right;
        else throw new Error('Unable to parse pathID.');
        pathID = pathID.slice(1);
    }

    if (pathID[0] === 'l')
        node.left = new TreeNode(val);
    else if (pathID[0] === 'r')
        node.right = new TreeNode(val);
    else throw new Error('Unable to parse pathID.');

    updateTreeArray(binaryTreeRoot);
    renderTreeGraphic(binaryTreeRoot);
};

const displayEditNodeValueField = (target) => {
    const rect = target.getBoundingClientRect();
    const inputContainer = d3.select('#svg-container')
        .append('div')
        .attr('class', 'edit-value-container')
        .style('position', 'absolute')
        .style('width', rect.width+'px')
        .style('height', rect.height+'px')
        .style('left', rect.x+'px')
        .style('top', rect.y+'px');

    input = inputContainer.append('input')
        .attr('class', 'edit-value-input');
    input.node().focus();

    const currValue = getNodeValue(target);

    input.node().value = currValue;
    input.node().select();

    let userEscaped = false;

    input.on('keyup', (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            input.node().blur();
        } else if (e.key === 'Esc' || e.keyCode === 27) {
            userEscaped = true;
            input.node().blur();
        }
    });

    input.on('blur', () => {
        let newValue = userEscaped ? currValue : input.node().value;
        // parse the new value as a number, if it can be
        if (!isNaN(newValue) && newValue !== '') {
            newValue = parseFloat(newValue);
        }
        editNodeValue(target, newValue);
        inputContainer.remove();
    });


};

const getNodeValue = (target) => {
    let pathID = target.id;
    let node = binaryTreeRoot;
    // remove first character 's'
    pathID = pathID.slice(1);

    while (pathID.length > 1) {
        if (pathID[0] === 'l')
            node = node.left;
        else if (pathID[0] === 'r')
            node = node.right;
        else throw new Error('Unable to parse pathID.');
        pathID = pathID.slice(1);
    }

    if (pathID[0] === 'l')
        return node.left.val;
    else if (pathID[0] === 'r')
        return node.right.val;
    else throw new Error('Unable to parse pathID.');
};

const editNodeValue = (target, val) => {
    let pathID = target.id;
    let node = binaryTreeRoot;

    pathID = pathID.slice(1);

    while (pathID.length > 0) {
        if (pathID[0] === 'l')
            node = node.left;
        else if (pathID[0] === 'r')
            node = node.right;
        else throw new Error('Unable to parse pathID.');
        pathID = pathID.slice(1);
    }
    node.val = val;

    updateTreeArray(binaryTreeRoot);
    renderTreeGraphic(binaryTreeRoot);
};

const deleteNodeInTree = (target) => {
    let pathID = target.id;
    let node = binaryTreeRoot;
    // remove first character 's'
    pathID = pathID.slice(1);

    while (pathID.length > 1) {
        if (pathID[0] === 'l')
            node = node.left;
        else if (pathID[0] === 'r')
            node = node.right;
        else throw new Error('Unable to parse pathID.');
        pathID = pathID.slice(1);
    }

    if (pathID[0] === 'l')
        node.left = null;
    else if (pathID[0] === 'r')
        node.right = null;
    else throw new Error('Unable to parse pathID.');

    updateTreeArray(binaryTreeRoot);
    renderTreeGraphic(binaryTreeRoot);
};

const updateTreeArray = (root) => {
    const arr = [root.val];
    const queue = [root];

    // BFS algorithm to create array from tree
    while (queue.length > 0) {
        const node = queue.shift();
        if (node.left) {
            arr.push(node.left.val);
            queue.push(node.left);
        } else {
            arr.push(null);
        }
        if (node.right) {
            arr.push(node.right.val);
            queue.push(node.right);
        } else {
            arr.push(null);
        }
    }

    // trim all the extra nulls off the end of the array
    while (arr[arr.length - 1] === null) {
        arr.pop();
    }

    // update input field
    d3.select('#tree-array-input').node().value = JSON.stringify(arr);
};


/**
 * @param {TreeNode} node 
 * @returns {Number}
 */
const maxDepth = (root) => {
    if (root === null) return 0;
    const leftDepth = maxDepth(root.left);
    const rightDepth = maxDepth(root.right);
    return Math.max(leftDepth, rightDepth) + 1; // count current node
};

// TREE DATA
let binaryTreeRoot = null;


// START APP
const startApp = () => {
    const $svg = d3.select('#svg-container')
        .append('svg')
        .attr('id', 'svg-display')
        .append('g')
        .attr('id', 'svg-tree');

    // get DOM elements
    const $treeArrayInput = d3.select('#tree-array-input').node();

    // default treeArrayInput value
    $treeArrayInput.value = '[1,2,0,3,4,0,null,5,null,6,7,null,0]';

    // Event listeners
    d3.selectAll('#array-to-tree').on('click', () => {
        binaryTreeRoot = buildTreeFromArray(JSON.parse($treeArrayInput.value));
        renderTreeGraphic(binaryTreeRoot);
    });

    binaryTreeRoot = buildTreeFromArray(JSON.parse($treeArrayInput.value));
    renderTreeGraphic(binaryTreeRoot);

    // Toggle active state Collapsibles (Info, Examples, Options)

    // const menuItems = d3.selectAll('.menu-bar-list-item');
    // const collapsibles = d3.selectAll('.collapsible')

    // menuItems.each(function(d, i, nodes) {
    //         // console.log({this: this});
    //         console.log(d3.select(node[i]))
    //         // console.log('is it already active? ', d.classed('active'))
    // });
    // .on('click', function(x, y, z) {
    //     console.log({x, y, z})
    //     const activeClass = 'active';
    //     const alreadyIsActive = d3.select(this).classed(activeClass);
    //     d3.selectAll('.menu-bar-list-item').classed(activeClass, false);
    //     d3.selectAll('.collapsible').classed(activeClass, false);
    //     d3.select(this).classed(activeClass, !alreadyIsActive);
    //     // d3.selectAll('.collapsible').filter((d, i) => i === ).classed(activeClass, false);
    // });


    const menuItems = document.querySelectorAll('.menu-bar-list-item');
    const collapsibles = document.querySelectorAll('.collapsible');

    menuItems.forEach((menuItem, i) => {
        menuItem.addEventListener('click', () => {
            const alreadyIsActive = menuItem.classList.contains('active');
            menuItems.forEach(menuItem => menuItem.classList.remove('active'));
            collapsibles.forEach(collapsible => collapsible.classList.remove('active'));
            if (!alreadyIsActive) {
                menuItem.classList.add('active');
                collapsibles[i].classList.add('active');
            }
        });
    });




};

startApp();