<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/">
  <ItemList>
	<xsl:for-each select="Customer/Extn/CustomerWishListItemList/CustomerWishListItem">
    	<Item>
    		<xsl:attribute name="ItemID">
    			<xsl:value-of select="YFSItem/@ItemID" />
   			</xsl:attribute>
   			<xsl:attribute name="UnitOfMeasure">
   				<xsl:value-of select="YFSItem/@UnitOfMeasure" />
   			</xsl:attribute>
   			<xsl:attribute name="OrganizationCode">
   				<xsl:value-of select="YFSItem/@OrganizationCode" />
   			</xsl:attribute>
   		</Item>
   	</xsl:for-each>
  </ItemList>
</xsl:template>
</xsl:stylesheet>