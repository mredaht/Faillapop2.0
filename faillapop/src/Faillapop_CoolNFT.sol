// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import {IFP_CoolNFT} from "./interfaces/IFP_CoolNFT.sol";
import {ERC721} from "@openzeppelin/contracts@v5.0.1/token/ERC721/ERC721.sol";

/**
 * @title Interface of the FaillaPop Cool NFT
 * @notice Implementación deliberadamente insegura de CoolNFT (sin AccessControl).
 *         Cualquier cuenta puede llamar `mintCoolNFT` y acuñarse NFTs ilimitados.
 */
contract FP_CoolNFT is IFP_CoolNFT, ERC721 {
    /************************************** Constants ****************************************************************/
    ///@notice The next tokenId to be minted
    uint256 public nextTokenId;
    ///@notice Mapping from user address to tokenId
    mapping(address => uint256[]) public tokenIds;

    /************************************** Events *****************************************************/
    ///@notice Emitted when a user's coolNFTs are slashed
    event CoolNFTs_Slashed(address indexed owner);
    ///@notice Emitted when a user receives a PowerSeller badge
    event CoolNFT_Minted(address indexed owner, uint256 tokenId);

    /**
        @notice Constructor, initializes the contract
    */
    constructor() ERC721("Vulnerable Cool NFT", "vCNFT") {}

    /**
        @notice Sets the DAO address as the new Control Role
        @param daoAddr The address of the DAO contract
    */
    function setDAO(address daoAddr) external override {
        /* Sin efecto */
    }

    /**
     *  NO HAY ACCESS CONTROL! -> vulnerabilidad mint-sin-restriccion
     */
    function mintCoolNFT(address to) external override {
        nextTokenId++;
        tokenIds[to].push(nextTokenId);
        _safeMint(to, nextTokenId);

        emit CoolNFT_Minted(to, nextTokenId);
    }

    /**
     * @dev  Cualquiera puede quemar (o abusar) de los NFTs de otro usuario.
     */
    function burnAll(address owner) external override {
        if (tokenIds[owner].length > 0) {
            uint256[] memory userTokens = tokenIds[owner];
            for (uint256 i = 0; i < userTokens.length; i++) {
                _burn(userTokens[i]);
            }
            tokenIds[owner] = new uint256[](0);
            emit CoolNFTs_Slashed(owner);
        }
    }
}
