pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Proyect is Ownable  {
     using SafeMath for uint256;
struct Project{
    address wallet;
    uint fee; 
}
event ProyectAdded(uint id);
mapping(address => uint) internal ownerToProjectsCount;
mapping(uint => address) internal projectToOwner;
mapping(address => bool) internal allowedWallets;
Project[] public projects;
function checkAllowed(address _wallet) internal view returns (bool){
   
    return allowedWallets[_wallet]||false; 
}
modifier onlyAllowedWallets {
    if(address(msg.sender) != owner()){
        require(checkAllowed(msg.sender));
    }
     _;
}
function getProyectByOwner(address _owner) external view returns(uint[] memory) {
    uint[] memory result = new uint[](ownerToProjectsCount[_owner]);
    uint counter = 0;
    for (uint i = 0; i < projects.length; i++) {
      if (projectToOwner[i] == _owner) {
        result[counter] = i;
        counter++;
      }
    }
    return result;
  }
function _createProyect(address _wallet,uint _fee ) private{
    projects.push(Project(_wallet,_fee));
    ownerToProjectsCount[_wallet] = ownerToProjectsCount[_wallet].add(1);
    projectToOwner[ projects.length- 1] = _wallet;
    emit ProyectAdded(projects.length- 1);
}

function NewProject(address wallet,uint _fee) onlyAllowedWallets public {
    _createProyect(wallet,_fee);
    
    }
function addallowedWallet(address wallet) onlyAllowedWallets public {
    allowedWallets[wallet] = true;
    }
    function removeAllowedWallet(address wallet) onlyAllowedWallets public {
            allowedWallets[wallet] = false;

    } 
function depositToProject(uint _projectId,uint _amount)  public payable {
    require(_projectId < projects.length);
    require(msg.value >= _amount);
   payable( projects[_projectId].wallet).transfer(msg.value.sub(msg.value*projects[_projectId].fee/100));  
    }

    function withdraw(uint amount) public onlyOwner{
        require(amount<=address(this).balance);
        payable(owner()).transfer(amount);
    }
    function getBalanceContract() public onlyOwner view returns (uint){
        return address(this).balance;
    }





























}



