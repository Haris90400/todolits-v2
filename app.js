//jshint esversion:6
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1/todolistDB');
  console.log("Connected");

  const itemsSchema = new mongoose.Schema({
    name: String
  });

  const Item = new mongoose.model("Item",itemsSchema);

  const item1 = new Item({
    name: "Welcome to your todolist!"
  });

  const item2 = new Item({
    name: "Hit the + button add a new item."
  });

  const item3 = new Item({
    name: "<-- Hit this to delete an item."
  });

  const defaultItems = [item1,item2,item3];

  const CustomListSchema = {
    name: String,
    items: [itemsSchema]
  };

  const List = mongoose.model("List",CustomListSchema);

  

app.get("/", function(req, res) {

    Item.find({},function(err,foundItems){
      if (foundItems.length === 0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Added Data.")
          }
        });
        res.redirect("/");
          }
          else{
            res.render("list", {listTitle: "Today", newListItems: foundItems });
          }
        });
      });

  app.get("/:CustomId",function(req,res){

    const requestedId = req.params.CustomId;

    List.findOne({name: requestedId},function(err,foundList){

      if(!err){
        if (!foundList){
          //Create anew list
          const list = new List ({
            name: requestedId,
            items: defaultItems
          });
          list.save();
          res.redirect("/" +requestedId);
        }
        else{
          //Show an existing list
          res.render("list",{listTitle: foundList.name, newListItems:foundList.items} )
        }
      }
    });

    

   
    });

    




  app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.listTitle;
    
    const item = new Item({
      name: itemName
    });

    if(listName==="Today"){
      item.save();
      res.redirect("/");
    }
    else{

      List.findOne({name: listName},function(err, foundList){

        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      })
    }

    
  });

  app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;

    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Deleted.");
        res.redirect("/");
      }
      
    });
  });
  
 
  
}









app.listen(3000, function() {
  console.log("Server started on port 3000");
});
