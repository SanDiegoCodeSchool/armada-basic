# Setting up a Selenium Grid Using Docker

## Install required Docker images

docker pull selenium/hub
docker pull selenium/node-firefox
docker pull selenium/node-chrome
docker pull selenium/node-firefox-debug
docker pull selenium/node-chrome-debug


## Start selenium hub from a docker container

```
$ docker run -d -p 4444:4444 --name selenium-hub selenium/hub
```

You should now be able to see the console in a browser using `http://localhost:4444/grid/console`.


Selenium hub is started and next, we need to start nodes from Docker container, we need to start chrome node and Firefox node. We have installed both the node images into our Docker container in the installation process.

Now, let’s start with both the nodes one by one. Also, remember that you can run as many nodes as you wish. Here I have used two nodes only (chrome node and Firefox node).

Command to run chrome node from Docker: 

```
$ docker run -d --link selenium-hub:hub selenium/node-chrome
```

Command to run firefox node from Docker: 

```
$ docker run -d --link selenium-hub:hub selenium/node-firefox
```

After running chrome node and Firefox node, we need to run Chrome debug node and Firefox debug node as well. We run and install the chrome debug node and Firefox debug node for demonstration purposes and at the end of this tutorial, I will run a test case in both the debug nodes by using VNC (Virtual Network Computing) viewer.

```
$ docker run -d -P --link selenium-hub:hub selenium/node-chrome-debug
```

```
$ docker run -d -P --link selenium-hub:hub selenium/node-firefox-debug
```