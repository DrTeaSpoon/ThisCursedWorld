var statsPanel = $.CreatePanel( "Panel", $('#ContentPanel'), "" );
statsPanel.BLoadLayout( "file://{resources}/layout/custom_game/char_screen/stats_screen.xml", false, false );
statsPanel.visible = true;
currentChild = statsPanel;

var inventoryPanel = $.CreatePanel( "Panel", $('#ContentPanel'), "" );
inventoryPanel.BLoadLayout( "file://{resources}/layout/custom_game/char_screen/inventory_screen.xml", false, false );
inventoryPanel.visible = false;

function ToInventory(){
	currentChild.visible = false;
	inventoryPanel.visible = true;
	currentChild = inventoryPanel;
}
 function ToStats(){
	currentChild.visible = false;
	statsPanel.visible = true;
	currentChild = statsPanel;
} 
$('#root').visible = false;