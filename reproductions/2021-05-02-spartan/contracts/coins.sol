pragma solidity ^0.8.0;
import "OpenZeppelin/openzeppelin-contracts@4.0.0-rc.0/contracts/token/ERC20/ERC20.sol";

contract Sparta is ERC20 {
    address public DAO;
    constructor() ERC20("SPARTA","SPARTA") {
    }
    function mint(uint256 amount) external{
        _mint(msg.sender, amount);
    }
    function setDao(address addr) external{
        DAO = addr;
    }
}

contract Wbnb is ERC20 {
    constructor() ERC20("WBNB","WBNB") {
    }
    function mint(uint256 amount) external{
        _mint(msg.sender, amount);
    }
}

