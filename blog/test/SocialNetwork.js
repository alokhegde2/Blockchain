const SocialNetwork = artifacts.require('./SocialNetwork.sol');

require('chai').use(require('chai-as-promised')).should()

contract('SocialNetwork',([deployer,author,tipper])=>{
    let socialNetwork 

    before(async ()=>{
        socialNetwork = await SocialNetwork.deployed()
    })

    describe('deployment',()=>{
        it('deploys successfully',async ()=>{
            const address = await socialNetwork.address
            assert.notEqual(address,0x0)
            assert.notEqual(address,'')
            assert.notEqual(address,null)
            assert.notEqual(address,undefined)
        })

        it('has a name',async ()=>{
            const name = await socialNetwork.name()
            assert.equal(name,'BlockChain Social Network')
        })
    }) 

    describe('posts',async()=>{
        let result,postCount;

        before(async()=>{
            result = await socialNetwork.createPost('This is first post',{from: author })
            postCount = await socialNetwork.postCount()
        })

        it('create posts',async ()=>{
            //success
            assert.equal(postCount,1)
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(),postCount.toNumber(),'id is correct')
            assert.equal(event.content,'This is first post','Content is correct')
            assert.equal(event.tipAmount,'0','tip amount is correct')
            assert.equal(event.author,author,'author is correct')

            //Failure: Post must have content

            await socialNetwork.createPost('',{from:author}).should.be.rejected;
        })

        it('list posts',async ()=>{
            const post = await socialNetwork.posts(postCount)
            assert.equal(post.id.toNumber(),postCount.toNumber(),'id is correct')
            assert.equal(post.content,'This is first post','Content is correct')
            assert.equal(post.tipAmount,'0','tip amount is correct')
            assert.equal(post.author,author,'author is correct')
        })

        it('allows users to tip posts',async ()=>{
            //Track the autor balance before purchase
            let oldAuthorBalance
            oldAuthorBalance = await web3.eth.getBalance(author)
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

            result = await socialNetwork.tipPost(postCount, {from:tipper,value: web3.utils.toWei('1','Ether') })
            //success
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(),postCount.toNumber(),'id is correct')
            assert.equal(event.content,'This is first post','Content is correct')
            assert.equal(event.tipAmount,'1000000000000000000','tip amount is correct')
            assert.equal(event.author,author,'author is correct')

            //Check that author recived funds
            let newAuthorBalance
            newAuthorBalance = await web3.eth.getBalance(author)
            newAuthorBalance = new web3.utils.BN(newAuthorBalance)

            //check tip amount
            let tipAmount
            tipAmount = web3.utils.toWei('1','Ether')
            tipAmount = new web3.utils.BN(tipAmount)

            //Expected balance
            const expectedBalance = oldAuthorBalance.add(tipAmount)

            assert.equal(newAuthorBalance.toString(),expectedBalance.toString())

            //FAILURE: Tries to tip a post that does not exist
            await socialNetwork.tipPost(99,{from:tipper,value:web3.utils.toWei('1','Ether')}).should.be.rejected;
        })
    })
})