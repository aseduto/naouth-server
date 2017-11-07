CODE=$(curl -X POST --data "username=pippo&password=pluto&client_id=12345&response_type=code" -H "Content-Type: application/x-www-form-urlencoded" -i http://localhost:2025/login/?state=foobiz | grep -m 1 -o 'code=[^\&]*' | sed -n -e 's/^code=//p')

RES=$?

echo "--$CODE--$RES--"


CODE=$(curl -X POST --data "client_id=12345&grant_type=authorization_code&code=$CODE" -H "Content-Type: application/x-www-form-urlencoded" -i http://localhost:2025/token | grep -m 1 -o 'access_token":"[^"]*' | sed -n -e 's/^access_token":"//p')


RES=$?

echo "--$CODE--$RES--"


curl -X GET -H "Authorization: Bearer CODE" -i http://localhost:2025/secured


curl -X GET -H "Authorization: Bearer $CODE" -i http://localhost:2025/secured 
