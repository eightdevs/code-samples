echo "Geting file list from remote host"
REMOTE_FILES_LINE=`ssh -i ${SECRET_PATH} -q -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${USERNAME}@${REMOTE_HOST} "cd ${REMOTE_FOLDER} && ls"`
REMOTE_FILES=($REMOTE_FILES_LINE)
DBNAMES_LINE=()
len=${#REMOTE_FILES[@]}
for (( i=0; i<$len; i++ ))
do
  DBNAME=${REMOTE_FILES[$i]%_backupOn*}
  DBNAMES_BUFF+=$DBNAME' '
done
echo "Geting unique database names"
DBNAMES=($DBNAMES_BUFF)
SORTED_DBNAMES=($(echo "${DBNAMES[@]}" | tr ' ' '\n' | sort -u | tr '\n' ' '))
echo "List of restoring databases:"
echo "${SORTED_DBNAMES[@]}"
for name in "${SORTED_DBNAMES[@]}"
do
  echo "Geting latest dump for database: ${name}"
  COMMAND="cd backups && ls -t ${name}* | head -1"
  FILENAME=`ssh -i ${SECRET_PATH} -q -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${USERNAME}@${REMOTE_HOST} $COMMAND`
  echo "Copy file ${FILENAME}"
  scp -i ${SECRET_PATH} -q -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${USERNAME}@${REMOTE_HOST}:${REMOTE_FOLDER}/${FILENAME} ${FILENAME}
  echo "Restoring database from file: ${FILENAME}"
  pg_restore -w --format=c -v -d $name -1 ${FILENAME}
done
echo 'Successfully Restored'
exit 0