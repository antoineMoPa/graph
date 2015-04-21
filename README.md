# Graph
A reusable node UI that runs in modern browsers. Makes it easy to plug tools together to accomplish tasks.

![node image](http://40.media.tumblr.com/9d45c17433ac6c483093cdc2263e797e/tumblr_nly7j7tyxk1svno9go1_1280.png)

## Hacking that
### Adding your own node-types is easy
Please send a pull request if you do so (♥‿♥)

Let's say you want to add a node type in the "Array" category. First open `/node-types/array.js`. If you analyse the structure, you'll find `var types = {...}`. You will add an element to that object. Start with that:

    "epic stuff": {
        inputs: ["array"],    /* name your inputs and outputs */
        outputs: ["array"],
        icon: "",
        title_info: "html title of the menu element",
        info: "Informative text that shows up in your node",
        settings: {
            /* no settings for now ٩(^‿^)۶ */
        },
        calculate: function(nodes,id){
            // Your magic happens here
            var self = nodes[id];
            var res = root.get_input_result(nodes,id);
            console.log(res)   /* an array of your input results */
            potato = do_some_magic_stuff(deep_copy(res[0])) /* deep copy to avoid interfering with other nodes */

            function do_some_magic_stuff(arr){
                /* SO MAGIC */
                return arr;
            }
            // Return your data so other nodes can use it !!!
            self.result = [potato];
        }
    }

Read the `calculate` function to understand it and perform whatever operation you like on the data.

### Globally available functions

There is no jQuery. Pure JS with pulp and vitamin C.

`deep_copy(arr)` Copies stuff

`QSA(".some-class a")` Writing document.querySelectorAll() is too long, this is a shortcut

`SQSA(el,".some-class span")` Does querySelectorAll() on an item (`el`)

`root.node_for_id(id)` Get the dom element of a node

Look at `common-ui.js` for other functions.

### Using settings

Please look at other node-types with settings to find out, not too complicated.

# Warnings
* Loops make javascript unhappy.

# License

    Graph User Interace
    Copyright (C) 2015  Antoine Morin-Paulhus

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

# Current Version

0.0.3
