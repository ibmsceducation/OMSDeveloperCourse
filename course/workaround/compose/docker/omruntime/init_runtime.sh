#!/bin/bash
# Licensed Materials - Property of IBM
# IBM Sterling Order Management (5725-D10), IBM Order Management (5737-D18)
# (C) Copyright IBM Corp. 2018 All Rights Reserved.
# US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.

set -o allexport
. /tmp/oms/.env
set +o allexport

UPGRADE=""
if [[ $1 == "setup-upg" ]]; then
	UPGRADE="upgrade"
fi

export DPM=$(cat $RT/properties/sandbox.cfg | grep "^DATABASE_PROPERTY_MANAGEMENT=" | head -n1 | cut -d'=' -f2)
echo "DATABASE_PROPERTY_MANAGEMENT==$DPM"

if [[ "$DB_EXTERNAL" != "true" ]]; then
	if [[ "$DB_BACKUP_RESTORE" = "true" ]] && [[ -f "$DB_BACKUP_ZIP" ]] && [[ $1 == "setup" ]]; then
		echo "DB_BACKUP_RESTORE mode enabled. Unzipping $DB_BACKUP_ZIP to /var/oms ..." 
		cd /var/oms
		unzip $DB_BACKUP_ZIP
		DB_BACKUP_NAME=$(basename "$DB_BACKUP_ZIP" ".zip")
		chmod -R 777 /var/oms/$DB_BACKUP_NAME
	fi

	echo "Waiting for DB to start (including database creation first time). You can run 'docker logs -f om-db2server' in the mean while to see the db container log..."
	t=120
	while [ $t -ge 0 ]; do
		if [ -f /var/oms/db.ready ]; then
			break
		else
			let t='t-1'
			sleep 10s
		fi
	done
	if [ $t -eq 0 ]; then
		echo "DB didn't start after 20 minutes. Check DB settings and logs at 'docker logs -f om-db2server'."
		exit 1
	fi
	ts=`expr 120 - $t`
	tss=`expr 10 \* $ts`
	echo "DB started! Took $tss seconds."
	sleep 10s
fi

mkdir -p ${RT}/tmp

cp -a /tmp/oms/system_overrides.properties ${RT}/properties
sed -i "s/DB_HOST/${DB_HOST_IMAGE}/g;s/DB_PORT/${DB_PORT_IMAGE}/g;s/DB_DATA/${DB_DATA}/g;s/DB_USER/${DB_USER}/g;s/DB_PASS/${DB_PASS}/g;s/DB_SCHEMA_OWNER/${DB_SCHEMA_OWNER}/g" ${RT}/properties/system_overrides.properties
if [[ "$DB_VENDOR" != "DB2" ]]; then
	sed -i "s/jdbcService.db2Pool/#jdbcService.db2Pool/g" ${RT}/properties/system_overrides.properties
fi
if [[ "$DB_VENDOR" != "Oracle" ]]; then
	sed -i "s/jdbcService.oraclePool/#jdbcService.oraclePool/g" ${RT}/properties/system_overrides.properties
fi

if [ -f ${RT}/external_deployments/smcfs.ear ]; then
	echo "Updating existing ear with system_overrides.properties"
	cd $RT/tmp
	../jdk/bin/jar xf ../external_deployments/smcfs.ear properties.jar
	cd ../properties
	../jdk/bin/jar uf ../tmp/properties.jar system_overrides.properties
	cd ../tmp
	../jdk/bin/jar uf ../external_deployments/smcfs.ear properties.jar
fi
if [ -d ${RT}/external_deployments/smcfs.ear ]; then
	echo "Copying system_overrides.properties t existing ear"
	cp -a ${RT}/properties/system_overrides.properties ${RT}/external_deployments/smcfs.ear/properties.jar
fi
cd ${RT}/bin

if [[ $1 == setup* ]]; then
	if [[ "$DPM" = "true" ]]; then
		sed -i "s/DATABASE_PROPERTY_MANAGEMENT=true/DATABASE_PROPERTY_MANAGEMENT=false/g" $RT/properties/sandbox.cfg
	fi
	echo "Running entitydeployer (as a fallback if DB already created)..."
	./deployer.sh -t entitydeployer -l info -Dapplysqlonly=true
	if [[ "$DPM" = "true" ]]; then
		sed -i "s/DATABASE_PROPERTY_MANAGEMENT=false/DATABASE_PROPERTY_MANAGEMENT=true/g" $RT/properties/sandbox.cfg
	fi
	if [[ "$DPM" = "true" ]]; then
		echo "Loading properties to DB..." 
		./loadProperties.sh
	fi
fi
if [[ -f "${RT}/properties/system_overrides.properties" ]] && [[ "$DPM" = "true" ]]; then
	echo "Loading system_overrides.properties to DB..." 
	./manageProperties.sh -mode import -file "${RT}/properties/system_overrides.properties"
fi

if [[ "$DB_BACKUP_RESTORE" = "true" ]] && [[ $1 == "setup" ]]; then
	echo "DB components already created from db backup restore.."
else
	if [[ $1 == setup* ]]; then		
		echo "Loading FC..."
		cd ${RT}/repository/factorysetup && find . -name "*.restart" -exec rm -rf {} \; && cd ${RT}/bin
		./loadFactoryDefaults.sh $UPGRADE
		cd ${RT}/repository/factorysetup && find . -name "*.restart" -exec rm -rf {} \; && cd ${RT}/bin
		
		echo "Loading Views..."
		./loadCustomDB.sh $UPGRADE
	fi
fi

if [[ ${OM_INSTALL_LOCALIZATION} = "true" ]] && [[ ! -z "$OM_LOCALES" ]]; then
	echo "Setting up localization for locales - $OM_LOCALES ..."
	var=$( echo "$OM_LOCALES" | tr ',' ' ')
	for LOCALE in ""$var""
	do
		echo "Loading for locale: $LOCALE"
		./loadDefaults.sh ../repository/factorysetup/complete_installation/${LOCALE}_locale_installer.xml ../repository/factorysetup/complete_installation/XMLS
	done
	echo "Loading Language Pack translations ..."
	./sci_ant.sh -f localizedstringreconciler.xml import -Dsrc=$RT/repository/factorysetup/complete_installation/XMLS -Dbasefilename=ycplocalizedstrings
	./sci_ant.sh -f localizedstringreconciler.xml import -Dsrc=$RT/repository/factorysetup/isccs/XMLS -Dbasefilename=isccsliterals2translate
	./sci_ant.sh -f localizedstringreconciler.xml import -Dsrc=$RT/repository/factorysetup/wsc/XMLS -Dbasefilename=wscliterals2translate
	./sci_ant.sh -f localizedstringreconciler.xml import -Dsrc=$RT/repository/factorysetup/sfs/XMLS -Dbasefilename=sfsliterals2translate
fi

CUST_JAR=`echo "$(ls /tmp/oms/custjar/* 2>/dev/null)" |head -n1`
if [ ! -z "$CUST_JAR" ]; then 
	echo "Installing customization jar $CUST_JAR ..."
	./InstallService.sh $CUST_JAR
	./deployer.sh -t resourcejar
	./deployer.sh -t entitydeployer -l info

	echo "Building EAR..."
	./buildear.sh -Dappserver=websphere -Dwarfiles=${AP_WAR_FILES} -Dearfile=smcfs.ear -Ddevmode=${AP_DEV_MODE} -Dnowebservice=true -Dnoejb=true -Dnodocear=true -Dwebsphere-profile=liberty
	echo "Exploding smcfs.ear"
	cd ${RT}/external_deployments
	mv smcfs.ear smcfs.ear1
	mkdir smcfs.ear
	cd smcfs.ear
	$RT/jdk/bin/jar xf ../smcfs.ear1
	rm -rf ../smcfs.ear1
	rm -rf META_INF
	if [[ ! -d lib ]]; then
		mkdir lib
		mv *.jar lib
	fi
	var = $( echo "$AP_WAR_FILES" | tr ',' ' ')
	cd ${RT}/external_deployments/smcfs.ear
	for i in $var; do
		echo "Exploding $i ..."
		if [ -f $i ]; then
			mv $i ${i}1 && mkdir $i && cd $i && $RT/jdk/bin/jar xf ../${i}1 && cd ../ && rm -rf ${i}1
		else
			echo "$i not found."
		fi
	done
	
	#if [[ -f "${RT}/properties/customer_overrides.properties" ]]; then
	#	echo "Loading customer_overrides.properties to DB..." 
	#	./manageProperties.sh -mode import -file "${RT}/properties/customer_overrides.properties"
	#fi
fi

rm -rf ${RT}/tmp/*

echo "Runtime initialized."
