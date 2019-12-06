set -e
names=`psql -X -A -t -c "SELECT datname FROM pg_database WHERE datistemplate = false AND datname != 'postgres';"`
if [ $? -ne 0 ]; then
  echo "Backup not created, check db connection settings"
  exit 1
fi
for i in $names
do
  DUMP_FILE_NAME="${i}_backupOn`date +%Y-%m-%d-%H-%M`.dump"
  echo "Creating dump: $DUMP_FILE_NAME"
  pg_dump -C -w --format=c --blobs -v $i> $DUMP_FILE_NAME
  if [ $? -ne 0 ]; then
    rm $DUMP_FILE_NAME
    echo "Backup not created, check db connection settings"
    exit 1
  fi
  scp -i "$SECRET_PATH" -q -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $DUMP_FILE_NAME ${USERNAME}@${REMOTE_HOST}:${REMOTE_FOLDER}/
done

echo 'Successfully Backed Up'
exit 0