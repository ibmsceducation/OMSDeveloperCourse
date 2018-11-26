<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/">
  <ItemList>
	<xsl:for-each select="root-name/entries">
    	<Item OrganizationCode="Aurora-Corp">
    		<xsl:attribute name="ItemID">
    			<xsl:value-of select="@product_id" />
   			</xsl:attribute>
   			<xsl:attribute name="UnitOfMeasure">
   				<xsl:value-of select="@uom" />
   			</xsl:attribute>
   		</Item>
   	</xsl:for-each>
  </ItemList>
</xsl:template>
</xsl:stylesheet>