pragma solidity ^0.5.16;

contract SocialNetwork{
    string public name;  //State variable : belongs to entire smart contract

    uint public postCount = 0;

    mapping(uint => Post) public posts; //key value store , it stores data into the blockchain, its like key-value storage
    
    struct Post {
        uint id;
        string content;
        uint tipAmount;
        address payable author; //address of author 
    }

    event PostCreated(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    event PostTipped(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    constructor() public {
        name = "BlockChain Social Network";
    }

    function createPost(string memory _content) public {
        //require valid content
        require(bytes(_content).length>0);
        postCount++; //increment postcount
        //create post
        posts[postCount] =  Post(postCount,_content,0,msg.sender);  //msg.sender : we can get address of the sender //it adds the new post to the block chain //posts which is mapping
        //trigger event
        emit PostCreated(postCount,_content,0,msg.sender);
    }

    function tipPost(uint _id) public payable {
        //Make sure that id is valid
        require(_id>0 && _id <= postCount);
        //Fetch the post
        Post memory _post = posts[_id];     //it will effect in blockchain
        //Fetch the author
        address payable _author = _post.author;
        //Pay the author
        address(_author).transfer(msg.value);
        //Icrement the tip amount
        //1 ether === 1000000000000000000 (18-'0') Wei
        _post.tipAmount = _post.tipAmount + msg.value;
        //Update the post
        posts[_id] = _post;
        //Trigger on event
        emit PostTipped(postCount,_post.content,_post.tipAmount,_post.author);
    }
}